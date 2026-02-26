import mongoose from "mongoose";
import expenseModel from "../models/expense.model.js";
import departmentModel from "../models/department.model.js";
import exchangeRateModel from "../models/exchangeRate.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { v2 as cloudinary } from 'cloudinary'



//ADDING EXPENSE
export const addExpense = asyncHandler(async (req, res) => {
  const { title, amount, expenseDate, tags, currency } = req.body;

  if (!title || amount == null || !expenseDate || !currency) {
    throw new ApiError(400, "All fields are required");
  }

  const MAX_AMOUNT = 5000000;
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || isNaN(parsedAmount)) {
    throw new ApiError(400, "Invalid amount value");
  }

  if (parsedAmount <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }

  if (parsedAmount > MAX_AMOUNT) {
    throw new ApiError(400, "Amount exceeds allowed limit");
  }

  const department = await departmentModel.findOne({
    departmentName: { $regex: `^${req.user.dept}$`, $options: "i" },
  });

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (!department.isActive) {
    throw new ApiError(400, "Department is inactive. Cannot raise new expense.");
  }

  const exchangeDoc = await exchangeRateModel.findOne({ base: "INR" });

  if (!exchangeDoc) {
    throw new ApiError(500, "Rates unavailable");
  }

  const rate = exchangeDoc.rates.get(currency);

  if (!rate || !Number.isFinite(rate)) {
    throw new ApiError(400, "Unsupported or invalid currency rate");
  }

  const MAX_INR_AMOUNT = 10000000;
  const inrAmount = parsedAmount / rate;

  if (!Number.isFinite(inrAmount) || inrAmount <= 0) {
    throw new ApiError(400, "Invalid conversion result");
  }

  if (inrAmount > MAX_INR_AMOUNT) {
    throw new ApiError(400, "Converted amount exceeds INR system limit");
  }

  if (!req.file) {
    throw new ApiError(400, "Receipt file is required");
  }

  const uploadResult = await cloudinary.uploader.upload(req.file.path, {
    folder: "expenses",
  });

  const receiptUrl = uploadResult.secure_url;

  let parsedTags = [];
  if (tags) {
    try {
      parsedTags = JSON.parse(tags).map((tag) => {
        const clean = tag.trim().toLowerCase();
        return clean.startsWith("#") ? clean : `#${clean}`;
      });
    } catch {
      parsedTags = [];
    }
  }

  const created = await expenseModel.create({
    title: title.trim(),
    amount: Number(inrAmount.toFixed(2)),
    currency,
    originalAmount: parsedAmount,
    expenseDate: new Date(expenseDate),
    tags: parsedTags,
    receipt: receiptUrl,
    exchangeRate: Number(rate),
    raisedBy: {
      userId: req.user.userId,
      dept: req.user.dept,
    },
  });

  return res.status(201).json({
    message: "Expense created successfully",
    expense: created,
  });
});



//GETTING ALL EXPENSES by LOGGED IN USER
export const getMyExpenses = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // Pagination query params
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const requestedLimit = parseInt(req.query.limit) || 6;
  const limit = Math.min(Math.max(requestedLimit, 1), 50);
  const skip = (page - 1) * limit;

  const filter = {
    "raisedBy.userId": userId,
  };

  // Apply status filter
  if (req.query.status) {
    filter.status = req.query.status;
  }

  console.log("getMyExpenses filter:", filter, "page:", page, "limit:", limit);

  // Count total expenses
  const totalExpenses = await expenseModel.countDocuments({
    "raisedBy.userId": userId,
  });

  if (totalExpenses === 0) {
    return res.status(200).json({
      success: true,
      message: "No expenses found",
      expenses: [],
      pagination: {
        totalExpenses: 0,
        totalPages: 0,
        currentPage: page,
        limit,
      },
    });
  }

  // Fetch paginated expenses
  const expenses = await expenseModel
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(totalExpenses / limit);

  return res.status(200).json({
    success: true,
    expenses,
    pagination: {
      totalExpenses,
      totalPages,
      currentPage: page,
      limit,
    },
  });
});



//UPDATING THE EXPENSE
export const updateExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    throw new ApiError(400, "Invalid expense ID");
  }

  const expense = await expenseModel.findById(expenseId);

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  // Only allow update if pending
  if (expense.status !== "PENDING") {
    throw new ApiError(400, "Only pending expenses can be updated");
  }

  // Authorization
  if (
    req.user.role !== "ADMIN" &&
    expense.raisedBy.userId !== req.user.userId
  ) {
    throw new ApiError(403, "Unauthorized to update this expense");
  }

  const { title, originalAmount, expenseDate, tags } = req.body;

  const MAX_ORIGINAL_AMOUNT = 5000000;
  const MAX_INR_AMOUNT = 10000000;

  // Update title
  if (title) {
    expense.title = title.trim();
  }

  // AMOUNT VALIDATION + CONVERSION
  if (originalAmount != null) {
    const parsedAmount = Number(originalAmount);

    if (!Number.isFinite(parsedAmount) || isNaN(parsedAmount)) {
      throw new ApiError(400, "Invalid amount value");
    }

    if (parsedAmount <= 0) {
      throw new ApiError(400, "Amount must be greater than zero");
    }

    if (parsedAmount > MAX_ORIGINAL_AMOUNT) {
      throw new ApiError(400, "Amount exceeds allowed limit");
    }

    const exchangeDoc = await exchangeRateModel.findOne({
      base: "INR",
    });

    if (!exchangeDoc) {
      throw new ApiError(500, "Exchange rates unavailable");
    }

    const rate = exchangeDoc.rates.get(expense.currency);

    if (!rate || !Number.isFinite(rate)) {
      throw new ApiError(400, "Invalid currency rate");
    }

    const inrAmount = parsedAmount / rate;

    if (!Number.isFinite(inrAmount) || inrAmount <= 0) {
      throw new ApiError(400, "Invalid conversion result");
    }

    if (inrAmount > MAX_INR_AMOUNT) {
      throw new ApiError(400, "Converted amount exceeds INR limit");
    }

    expense.originalAmount = parsedAmount;
    expense.amount = Number(inrAmount.toFixed(2));
    expense.exchangeRate = Number(rate);
  }

  // Update date
  if (expenseDate) {
    expense.expenseDate = new Date(expenseDate);
  }

  // Update tags
  if (tags) {
    try {
      const parsedTags = JSON.parse(tags);

      expense.tags = [
        ...new Set(
          parsedTags.map((tag) => {
            const clean = tag.trim().toLowerCase();
            return clean.startsWith("#")
              ? clean
              : `#${clean}`;
          })
        ),
      ];
    } catch {
      expense.tags = [];
    }
  }

  // Update receipt if new file
  if (req.file) {
    const uploadResult = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "expenses" }
    );

    expense.receipt = uploadResult.secure_url;
  }

  await expense.save();

  return res.status(200).json({
    success: true,
    message: "Expense updated successfully",
    expense,
  });
});



//EXPENSE SUMMARY
export const getExpenseSummary = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const summary = await expenseModel.aggregate([
    {
      $match: {
        "raisedBy.userId": userId,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
        approved: {
          $sum: {
            $cond: [{ $eq: ["$status", "APPROVED"] }, "$amount", 0],
          },
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$status", "PENDING"] }, "$amount", 0],
          },
        },
        firstExpenseDate: { $min: "$expenseDate" },
      },
    },
  ]);

  if (!summary.length) {
    return res.json({
      success: true,
      summary: {
        total: 0,
        approved: 0,
        pending: 0,
        monthlyAverage: 0,
      },
    });
  }

  const result = summary[0];

  const now = new Date();
  const firstDate = new Date(result.firstExpenseDate);

  const monthsDiff =
    (now.getFullYear() - firstDate.getFullYear()) * 12 +
    (now.getMonth() - firstDate.getMonth()) +
    1;

  const monthlyAverage = result.total / monthsDiff;

  return res.json({
    success: true,
    summary: {
      total: result.total,
      approved: result.approved,
      pending: result.pending,
      monthlyAverage,
    },
  });
});




//APPROVING THE EXPENSE
export const approveExpense = asyncHandler(async (req, res) => {
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Access denied");
  }

  const { expId } = req.params;

  const expense = await expenseModel.findById(expId);

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  if (expense.status === "APPROVED") {
    throw new ApiError(400, "Expense already approved");
  }

  if (expense.status === "REJECTED") {
    throw new ApiError(400, "Rejected expense cannot be approved");
  }

  const deptKey = (expense.raisedBy?.dept || "").trim().toUpperCase();
  const amount = Number(expense.amount);

  if (!deptKey) {
    throw new ApiError(400, "Department missing in expense");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, "Invalid expense amount");
  }

  const updatedDept = await departmentModel.findOneAndUpdate(
    {
      departmentName: deptKey,
      $expr: { $gte: ["$totalBudget", { $add: ["$consumedBudget", amount] }] },
    },
    { $inc: { consumedBudget: amount } },
    { new: true }
  );

  if (!updatedDept) {
    throw new ApiError(
      400,
      "Not enough budget to approve this expense OR department not found"
    );
  }

  // Approving expense with rollback safety
  try {
    expense.status = "APPROVED";
    expense.approvedAt = new Date();
    expense.approvedBy = req.user.userId;
    await expense.save();
  } catch (err) {
    // rollback budget
    await departmentModel.updateOne(
      { departmentName: deptKey },
      { $inc: { consumedBudget: -amount } }
    );

    throw err; // let asyncHandler forward to errorMiddleware
  }

  return res.status(200).json({
    success: true,
    message: "Expense approved & budget deducted",
    title: expense.title,
    userId: expense.raisedBy.userId,
    department: expense.raisedBy.dept,
    status: expense.status,
    ExpenseAmount: expense.amount,
    department: {
      departmentName: updatedDept.departmentName,
      totalBudget: updatedDept.totalBudget,
      consumedBudget: updatedDept.consumedBudget,
      remainingBudget:
        updatedDept.totalBudget - updatedDept.consumedBudget,
    },
  });
});


//REJECT EXEPENSE
export const rejectExpense = asyncHandler(async (req, res) => {
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Access denied");
  }

  const { expId } = req.params;

  const expense = await expenseModel.findById(expId);

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  if (expense.status === "REJECTED") {
    throw new ApiError(400, "Expense already rejected");
  }

  if (expense.status === "APPROVED") {
    throw new ApiError(400, "Approved expense cannot be rejected");
  }

  expense.status = "REJECTED";
  expense.rejectedAt = new Date();
  expense.rejectedBy = req.user.userId;

  await expense.save();

  return res.status(200).json({
    success: true,
    message: "Expense rejected successfully",
    title: expense.title,
    userId: expense.raisedBy.userId,
    department: expense.raisedBy.dept,
    status: expense.status,
    amount: expense.amount,
  });
});






//GENERATING ADMIN REPORT 
export const generateAdminReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, "startDate and endDate are required");
  }

  const matchStage = {
    status: "APPROVED",
    expenseDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const report = await expenseModel.aggregate([
    { $match: matchStage },
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalExpenseAmt: { $sum: "$amount" },
              ExpenseCount: { $sum: 1 },
            },
          },
        ],
        byDepartment: [
          {
            $group: {
              _id: "$raisedBy.dept",
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ],
        byEmployee: [
          {
            $group: {
              _id: "$raisedBy.userId",
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
        ],
      },
    },
  ]);

  const result = report[0] || {
    overall: [],
    byDepartment: [],
    byEmployee: [],
  };

  return res.json({
    success: true,
    fromDate: startDate,
    toDate: endDate,
    totalExpenseAmt: result.overall[0]?.totalExpenseAmt || 0,
    ExpenseCount: result.overall[0]?.ExpenseCount || 0,
    byDepartment: result.byDepartment,
    byEmployee: result.byEmployee,
    generatedAt: new Date(),
  });
});


//GENERATING ADMIN STATS
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  if (month < 1 || month > 12) {
    throw new ApiError(400, "month must be between 1 and 12");
  }

  const startOfMonth = new Date(year, month - 1, 1);
  const startOfNextMonth = new Date(year, month, 1);

  const stats = await expenseModel.aggregate([
    {
      $facet: {
        approvedThisMonth: [
          {
            $match: {
              status: "APPROVED",
              expenseDate: { $gte: startOfMonth, $lt: startOfNextMonth },
            },
          },
          {
            $group: {
              _id: null,
              totalApprovedAmount: { $sum: "$amount" },
              approvedCount: { $sum: 1 },
            },
          },
        ],
        pendingThisMonth: [
          {
            $match: {
              status: "PENDING",
              expenseDate: { $gte: startOfMonth, $lt: startOfNextMonth },
            },
          },
          {
            $group: {
              _id: null,
              pendingCount: { $sum: 1 },
              pendingAmount: { $sum: "$amount" },
            },
          },
        ],
        topDepartment: [
          {
            $match: {
              status: "APPROVED",
              expenseDate: { $gte: startOfMonth, $lt: startOfNextMonth },
            },
          },
          {
            $group: {
              _id: "$raisedBy.dept",
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 1 },
        ],
        topEmployee: [
          {
            $match: {
              status: "APPROVED",
              expenseDate: { $gte: startOfMonth, $lt: startOfNextMonth },
            },
          },
          {
            $group: {
              _id: "$raisedBy.userId",
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 1 },
        ],
      },
    },
  ]);

  const result = stats?.[0] || {};

  const approvedThisMonth = result.approvedThisMonth?.[0] || {
    totalApprovedAmount: 0,
    approvedCount: 0,
  };

  const pendingThisMonth = result.pendingThisMonth?.[0] || {
    pendingCount: 0,
    pendingAmount: 0,
  };

  const topDepartment = result.topDepartment?.[0] || null;
  const topEmployee = result.topEmployee?.[0] || null;

  return res.status(200).json({
    success: true,
    month,
    year,
    period: { from: startOfMonth, to: startOfNextMonth },
    approvedThisMonth: {
      totalApprovedAmount: approvedThisMonth.totalApprovedAmount || 0,
      approvedCount: approvedThisMonth.approvedCount || 0,
    },
    pending: {
      pendingCount: pendingThisMonth.pendingCount || 0,
      pendingAmount: pendingThisMonth.pendingAmount || 0,
    },
    topDepartment: topDepartment
      ? {
          department: topDepartment._id,
          total: topDepartment.total,
          count: topDepartment.count,
        }
      : null,
    topEmployee: topEmployee
      ? {
          userId: topEmployee._id,
          total: topEmployee.total,
          count: topEmployee.count,
        }
      : null,
    generatedAt: new Date(),
  });
});



//MONTH WISE EXPENSES TOTALS
export const getMonthlyExpenseSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const year = Number(req.query.year) || now.getFullYear();

  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const statusFilter = req.query.status || "APPROVED";

  const result = await expenseModel.aggregate([
    {
      $match: {
        status: statusFilter,
        expenseDate: { $gte: start, $lt: end },
      },
    },
    {
      $group: {
        _id: { $month: "$expenseDate" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const map = new Map(result.map((r) => [r._id, r]));

  const data = months.map((m, idx) => {
    const monthIndex = idx + 1;
    const row = map.get(monthIndex);
    return {
      month: m,
      totalAmount: row?.totalAmount || 0,
      count: row?.count || 0,
    };
  });

  return res.status(200).json({
    success: true,
    year,
    status: statusFilter,
    data,
    generatedAt: new Date(),
  });
});



//GET ALL EXPENSES
export const getAllExpensesAdmin = asyncHandler(async (req, res) => {
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Access denied");
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const requestedLimit = parseInt(req.query.limit) || 6;
  const limit = Math.min(Math.max(requestedLimit, 1), 50);
  const skip = (page - 1) * limit;

  const status = req.query.status;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const totalExpenses = await expenseModel.countDocuments(filter);

  const expenses = await expenseModel
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalExpenses / limit);

  return res.status(200).json({
    expenses,
    pagination: {
      totalExpenses,
      totalPages,
      currentPage: page,
      limit,
    },
  });
});




//GET EXEPSNSE BY ID
export const getExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid expense ID");
  }

  const expense = await expenseModel.findById(id);

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  return res.status(200).json({
    message: "Expense fetched successfully",
    expense,
  });
});


//DELETE EXPENSE
export const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid expense ID");
  }

  const expense = await expenseModel.findById(id);

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  // Admin can delete any expense
  if (req.user.role === "ADMIN") {
    await expenseModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Expense deleted successfully by Admin",
    });
  }

  // Employee can delete ONLY their own expense
  if (req.user.role === "EMPLOYEE") {
    if (expense.raisedBy.userId !== req.user.userId) {
      throw new ApiError(403, "You can only delete your own expenses");
    }

    await expenseModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Expense deleted successfully",
    });
  }

  // Fallback safety
  throw new ApiError(403, "Unauthorized action");
});

//Tags STATS
export const getTagAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const analytics = await expenseModel.aggregate([
    {
      $match: { "raisedBy.userId": userId },
    },
    {
      $unwind: "$tags",
    },
    {
      $group: {
        _id: "$tags",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { totalAmount: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  return res.status(200).json({
    success: true,
    analytics,
  });
});
















// db.expenses.aggregate([
//   // :one: Match on the selected month
//   {
//     $match: {
//       expenseDate: { $gte: startOfMonth, $lt: startOfNextMonth }
//     }
//   },
//   // :two: Project only the fields we need
//   {
//     $project: {
//       amount: 1,
//       status: 1,
//       dept: "$raisedBy.dept",
//       userId: "$raisedBy.userId"
//     }
//   },
//   // :three: Group everything into one document
//   {
//     $group: {
//       _id: null,
//       // Total Approved
//       totalApprovedAmount: {
//         $sum: {
//           $cond: [{ $eq: ["$status", "APPROVED"] }, "$amount", 0]
//         }
//       },
//       approvedCount: {
//         $sum: {
//           $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0]
//         }
//       },
//       // Total Pending
//       pendingAmount: {
//         $sum: {
//           $cond: [{ $eq: ["$status", "PENDING"] }, "$amount", 0]
//         }
//       },
//       pendingCount: {
//         $sum: {
//           $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0]
//         }
//       },
//       // Prepare for top department
//       deptTotals: {
//         $push: {
//           dept: "$dept",
//           amount: "$amount",
//           isApproved: { $eq: ["$status", "APPROVED"] }
//         }
//       },
//       // Prepare for top employee
//       employeeTotals: {
//         $push: {
//           userId: "$userId",
//           amount: "$amount",
//           isApproved: { $eq: ["$status", "APPROVED"] }
//         }
//       }
//     }
//   },
//   // :four: Compute top department and top employee
//   {
//     $addFields: {
//       topDepartment: {
//         $first: {
//           $sortArray: {
//             input: {
//               $filter: {
//                 input: "$deptTotals",
//                 cond: { $eq: ["$$this.isApproved", true] }
//               }
//             },
//             sortBy: { amount: -1 }
//           }
//         }
//       },
//       topEmployee: {
//         $first: {
//           $sortArray: {
//             input: {
//               $filter: {
//                 input: "$employeeTotals",
//                 cond: { $eq: ["$$this.isApproved", true] }
//               }
//             },
//             sortBy: { amount: -1 }
//           }
//         }
//       }
//     }
//   },
//   // :five: Clean up intermediate arrays
//   {
//     $project: {
//       deptTotals: 0,
//       employeeTotals: 0
//     }
//   }
// ]);


// db.expenses.aggregate([
//   // :one: Match on the selected month
//   {
//     $match: {
//       expenseDate: { $gte: startOfMonth, $lt: startOfNextMonth }
//     }
//   },
//   // :two: Group by status
//   {
//     $group: {
//       _id: "$status",
//       totalAmount: { $sum: "$amount" },
//       count: { $sum: 1 },
//       deptTotals: { $push: { dept: "$raisedBy.dept", amount: "$amount" } },
//       employeeTotals: { $push: { userId: "$raisedBy.userId", amount: "$amount" } }
//     }
//   },
//   // :three: Reshape the document to have separate fields for approved/pending
//   {
//     $project: {
//       status: "$_id",
//       _id: 0,
//       totalAmount: 1,
//       count: 1,
//       deptTotals: 1,
//       employeeTotals: 1
//     }
//   },
//   // :four: Group everything back into a single document
//   {
//     $group: {
//       _id: null,
//       approved: {
//         $first: {
//           $cond: [{ $eq: ["$status", "APPROVED"] }, { totalAmount: "$totalAmount", count: "$count" }, { totalAmount: 0, count: 0 }]
//         }
//       },
//       pending: {
//         $first: {
//           $cond: [{ $eq: ["$status", "PENDING"] }, { totalAmount: "$totalAmount", count: "$count" }, { totalAmount: 0, count: 0 }]
//         }
//       },
//       allDeptTotals: { $push: "$deptTotals" },
//       allEmployeeTotals: { $push: "$employeeTotals" }
//     }
//   },
//   // :five: Flatten arrays and compute top department and employee
//   {
//     $addFields: {
//       allDeptTotals: { $reduce: { input: "$allDeptTotals", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } },
//       allEmployeeTotals: { $reduce: { input: "$allEmployeeTotals", initialValue: [], in: { $concatArrays: ["$$value", "$$this"] } } }
//     }
//   },
//   {
//     $addFields: {
//       topDepartment: {
//         $first: { $sortArray: { input: "$allDeptTotals", sortBy: { amount: -1 } } }
//       },
//       topEmployee: {
//         $first: { $sortArray: { input: "$allEmployeeTotals", sortBy: { amount: -1 } } }
//       }
//     }
//   },
//   {
//     $project: {
//       allDeptTotals: 0,
//       allEmployeeTotals: 0
//     }
//   }
// ]);
