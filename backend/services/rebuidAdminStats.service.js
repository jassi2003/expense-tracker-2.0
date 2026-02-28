import cron from "node-cron";
import expenseModel from "../models/expense.model.js";
import historicalAdminStatsModel from "../models/HistoricalAdminStats.model.js";


console.log(" cron module loaded");

export const rebuildAdminStats = async() => {
    console.log(" Running admin monthly stats rebuild...");

    try {
        const now = new Date();

        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const monthStart = new Date(year, month - 1, 1);

        //  Get existing stats document
        let statsDoc = await historicalAdminStatsModel.findOne({ year, month });

        const lastRebuildAt = statsDoc?.lastRebuildAt || monthStart;

        console.log("Last rebuild at:", lastRebuildAt);

        //  Aggregate only new data
        const aggregation = await expenseModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: lastRebuildAt, $lt: now },
                },
            },
            {
                $group: {
                    _id: {
                        status: "$status",
                        dept: "$raisedBy.dept",
                        userId: "$raisedBy.userId",
                    },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        if (!statsDoc) {
            statsDoc = await historicalAdminStatsModel.create({
                year,
                month,
            });
        }

        //  Appling incremental updates
        for (const row of aggregation) {
            const { status, dept, userId } = row._id;

            if (status === "APPROVED") {
                statsDoc.approved.totalAmount += row.totalAmount;
                statsDoc.approved.count += row.count;

                const deptKey = dept?.trim().toUpperCase();
                if (deptKey) {
                    statsDoc.deptTotals.set(
                        deptKey,
                        (statsDoc.deptTotals.get(deptKey) || 0) + row.totalAmount
                    );
                }

                if (userId) {
                    statsDoc.empTotals.set(
                        userId,
                        (statsDoc.empTotals.get(userId) || 0) + row.totalAmount
                    );
                }
            }

            if (status === "PENDING") {
                statsDoc.pending.totalAmount += row.totalAmount;
                statsDoc.pending.count += row.count;
            }

              if (status === "REJECTED") {
    statsDoc.rejected.totalAmount += row.totalAmount;
    statsDoc.rejected.count += row.count;
  }
        }

        //  Recalculating top department and employee
        let highestDept = null;
        let highestDeptAmount = 0;

        for (const [key, value] of statsDoc.deptTotals.entries()) {
            if (value > highestDeptAmount) {
                highestDeptAmount = value;
                highestDept = key;
            }
        }

        let highestEmp = null;
        let highestEmpAmount = 0;

        for (const [key, value] of statsDoc.empTotals.entries()) {
            if (value > highestEmpAmount) {
                highestEmpAmount = value;
                highestEmp = key;
            }
        }

        statsDoc.topDepartment = highestDept
            ? { department: highestDept, totalAmount: highestDeptAmount }
            : null;

        statsDoc.topEmployee = highestEmp
            ? { userId: highestEmp, totalAmount: highestEmpAmount }
            : null;

        //  Update watermark
        statsDoc.lastRebuildAt = now;
        statsDoc.updatedAt = now;

        await statsDoc.save();

        console.log(" Resilient rebuild completed successfully");
    } catch (error) {
        console.error(" Resilient rebuild failed:", error);
    }
};




// import expenseModel from "../models/expense.model.js";
// import historicalAdminStatsModel from "../models/HistoricalAdminStats.model.js";

// const pipeline = (start, end) => [
//   {
//     $match: {
//       createdAt: { $gte: start, $lt: end }, // or expenseDate
//     },
//   },

//   // Compute everything in parallel
//   {
//     $facet: {
//       // 1) status totals
//       statusTotals: [
//         {
//           $group: {
//             _id: "$status",
//             totalAmount: { $sum: "$amount" },
//             count: { $sum: 1 },
//           },
//         },
//       ],

//       // 2) department totals (usually only for approved)
//       deptTotals: [
//         { $match: { status: "APPROVED" } },
//         {
//           $group: {
//             _id: { $toUpper: { $trim: { input: "$raisedBy.dept" } } },
//             totalAmount: { $sum: "$amount" },
//           },
//         },
//         { $sort: { totalAmount: -1 } },
//       ],

//       // 3) employee totals (approved)
//       empTotals: [
//         { $match: { status: "APPROVED" } },
//         {
//           $group: {
//             _id: "$raisedBy.userId",
//             totalAmount: { $sum: "$amount" },
//           },
//         },
//         { $sort: { totalAmount: -1 } },
//       ],
//     },
//   },

//   // Shape the result nicely
//   {
//     $project: {
//       statusTotals: 1,
//       deptTotals: 1,
//       empTotals: 1,
//       topDepartment: { $arrayElemAt: ["$deptTotals", 0] },
//       topEmployee: { $arrayElemAt: ["$empTotals", 0] },
//     },
//   },
// ];



// export const rebuildAdminStats = async () => {
//   console.log("Running stats rebuild...");

//   const now = new Date();
//   const year = now.getFullYear();
//   const month = now.getMonth() + 1;
//   const monthStart = new Date(year, month - 1, 1);

//   let statsDoc = await historicalAdminStatsModel.findOne({ year, month });
//   const lastRebuildAt = statsDoc?.lastRebuildAt || monthStart;

//   const [result] = await expenseModel.aggregate(pipeline(lastRebuildAt, now));

//   // convert statusTotals array -> object
//   const statusMap = Object.fromEntries(
//     (result.statusTotals || []).map((s) => [
//       s._id,
//       { totalAmount: s.totalAmount, count: s.count },
//     ])
//   );

//   // Ensure doc exists
//   if (!statsDoc) statsDoc = await historicalAdminStatsModel.create({ year, month });

//   //  If you want INCREMENTAL since lastRebuildAt, then ADD to existing:
//   statsDoc.approved.totalAmount += statusMap.APPROVED?.totalAmount || 0;
//   statsDoc.approved.count += statusMap.APPROVED?.count || 0;

//   statsDoc.pending.totalAmount += statusMap.PENDING?.totalAmount || 0;
//   statsDoc.pending.count += statusMap.PENDING?.count || 0;

//   statsDoc.rejected.totalAmount += statusMap.REJECTED?.totalAmount || 0;
//   statsDoc.rejected.count += statusMap.REJECTED?.count || 0;

//   // deptTotals / empTotals are still “grouped results” since lastRebuildAt
//   for (const d of result.deptTotals || []) {
//     if (!d._id) continue;
//     statsDoc.deptTotals.set(d._id, (statsDoc.deptTotals.get(d._id) || 0) + d.totalAmount);
//   }

//   for (const e of result.empTotals || []) {
//     if (!e._id) continue;
//     statsDoc.empTotals.set(e._id, (statsDoc.empTotals.get(e._id) || 0) + e.totalAmount);
//   }

//   // recompute top from the Maps (small loop, fine)
//   // OR you can compute top from the *full* month in aggregation (see below)

//   statsDoc.lastRebuildAt = now;
//   statsDoc.updatedAt = now;
//   await statsDoc.save();

//   console.log("stats rebuild done");
// };