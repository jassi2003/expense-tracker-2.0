import expenseReportModel from "../models/expenseReport.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import expenseModel from "../models/expense.model.js";
import ApiError from "../utils/ApiError.js";
import departmentModel from "../models/department.model.js";

//CREATE EXPENSE REPORT 
export const createReport = asyncHandler(async (req, res) => {

  try {
    const { reportName, purpose, date } = req.body;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new ApiError(401, "Organization not found in token");
    }
    const report = await expenseReportModel.create({
      reportName,
      purpose,
      date,
      status: "DRAFT",
      organizationId,
       raisedBy: {
      userId: req.user.userId,
      dept: req.user.dept,
    },
    });

    res.status(201).json({
      success: true,
      report
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }

});


//GETTING REPORTS OF LOGGED IN EMPLOYEE
export const getMyReports = asyncHandler(async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 5, 1);
    const skip = (page - 1) * limit;

    const filter = {
      organizationId,
      "raisedBy.userId": req.user.userId
    };

    const [reports, totalReports] = await Promise.all([
      expenseReportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      expenseReportModel.countDocuments(filter)
    ]);

    res.json({
      success: true,
      reports,
      page,
      limit,
      totalReports,
      totalPages: Math.ceil(totalReports / limit)
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
});


// GETTING ALL EXPENSES IN THAT REPORT OF LOGGED IN USER
export const getExpensesByReport = asyncHandler(async (req, res) => {

  const { reportId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, "Invalid report id");
  }
  const employeeId = req.user.userId;
  const organizationId = req.user?.organizationId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const report = await expenseReportModel.findOne({
    organizationId,
  "raisedBy.userId": req.user.userId,
    _id: reportId,
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  // fetch paginated expenses
const [expenses, totalExpenses] = await Promise.all([
  expenseModel
    .find({ reportId })
    .sort({ expenseDate: -1 })
    .skip(skip)
    .limit(limit),

  expenseModel.countDocuments({ reportId })
]);

  return res.status(200).json({
    success: true,
    reportName: report.reportName,
    totalAmount: report.totalAmount,
    page,
    limit,
    totalExpenses,
    totalPages: Math.ceil(totalExpenses / limit),
    expenses
  });
});



//DELETING ONLY "DRAFT" REPORT AND ALL EXPENSES INSIDE IT
export const deleteDraftReport = asyncHandler(async (req, res) => {

  const { reportId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const report = await expenseReportModel.findOneAndDelete(
      { _id: reportId,
         status: "DRAFT" },
      { session }
    );

    if (!report) {
      throw new ApiError(404, "Report not found or not a draft");
    }

    await expenseModel.deleteMany({ reportId }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Report deleted successfully"
    });

  } catch (error) {

    await session.abortTransaction();
    session.endSession();
    throw error;

  }

});



// SUBMIT EXPENSE REPORT and updating the expense status to "pending"
export const submitReport = asyncHandler(async (req, res) => {

  const { reportId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, "Invalid report id");
  }

  const organizationId = req.user?.organizationId;

  const report = await expenseReportModel.findOne({
    organizationId,
    "raisedBy.userId": req.user.userId,
    _id: reportId
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  if (report.status !== "DRAFT") {
    throw new ApiError(400, "Only draft reports can be submitted");
  }

  // check if report has expenses
  const expenseCount = await expenseModel.countDocuments({ reportId });

  if (expenseCount === 0) {
    throw new ApiError(400, "Cannot submit empty report");
  }

  // update report status
  report.status = "SUBMITTED";
  await report.save();

  // update all expenses status
  await expenseModel.updateMany(
    { reportId },
    { status: "PENDING" }
  );

  return res.status(200).json({
    success: true,
    message: "Report submitted successfully",
    report
  });
});




//ADMIN ACTIONS
export const reviewExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const { action, reason } = req.body;

  const organizationId = req.user?.organizationId;

  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    throw new ApiError(400, "Invalid expense id");
  }

  const allowedActions = ["APPROVED", "REJECTED", "FLAGGED"];

  if (!allowedActions.includes(action)) {
    throw new ApiError(400, "Invalid action");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expense = await expenseModel.findOne({
      organizationId,
      _id: expenseId
    }).session(session);

    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }

    if (expense.status !== "PENDING") {
      throw new ApiError(400, "Only PENDING expenses can be reviewed");
    }

    let departmentBudget = null;

    //APPROVE EXPENSE
    if (action === "APPROVED") {

      const deptKey = (expense.raisedBy?.dept || "").trim().toUpperCase();
      const amount = Number(expense.amount);

      if (!deptKey) {
        throw new ApiError(400, "Department missing in expense");
      }

      const updatedDept = await departmentModel.findOneAndUpdate(
        {
          departmentName: deptKey,
          organizationId,
          $expr: {
            $gte: ["$totalBudget", { $add: ["$consumedBudget", amount] }]
          }
        },
        { $inc: { consumedBudget: amount } },
        { new: true, session }
      );

      if (!updatedDept) {
        throw new ApiError(
          400,
          "Not enough department budget to approve this expense"
        );
      }

      departmentBudget = {
        departmentName: updatedDept.departmentName,
        totalBudget: updatedDept.totalBudget,
        consumedBudget: updatedDept.consumedBudget,
        remainingBudget:
          updatedDept.totalBudget - updatedDept.consumedBudget,
      };

      expense.approvedAt = new Date();
      expense.approvedBy = req.user.userId;
    }

    //FLAGGED
    if (action === "FLAGGED") {
      expense.flagReason = reason || "Requires correction";
    }

    expense.status = action;

    await expense.save({ session });

    // UPDATE REPORT STATUS
let reportStatus = "SUBMITTED";

if (expense.reportId) {

  const statusCounts = await expenseModel.aggregate([
    { $match: { reportId: expense.reportId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]).session(session);

  const counts = {};
  statusCounts.forEach(s => {
    counts[s._id] = s.count;
  });

  const totalExpenses = Object.values(counts).reduce((a, b) => a + b, 0);

  if (counts.APPROVED === totalExpenses) {
    reportStatus = "APPROVED";
  } 
  else if (counts.REJECTED === totalExpenses) {
    reportStatus = "REJECTED";
  } 
  else if (counts.FLAGGED > 0) {
    reportStatus = "FLAGGED";
  }

  await expenseReportModel.findByIdAndUpdate(
    expense.reportId,
    { status: reportStatus },
    { session }
  );
}

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Expense ${action.toLowerCase()} successfully`,
      expenseStatus: expense.status,
      reportStatus,
      departmentBudget
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});






// GET ALL REPORTS FOR ADMIN (WITH PAGINATION)
export const getAllReports = asyncHandler(async (req, res) => {

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);

  const skip = (page - 1) * limit;

  const reports = await expenseReportModel
    .find({ 
      organizationId,    
  status: { $in: ["SUBMITTED", "APPROVED", "REJECTED", "FLAGGED"] }
 }) // for multi-tenant
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalReports = await expenseReportModel.countDocuments({
    organizationId, 
    status: { $in: ["SUBMITTED", "APPROVED", "REJECTED", "FLAGGED"] }

  });

  res.status(200).json({
    success: true,
    page,
    limit,
    totalReports,
    totalPages: Math.ceil(totalReports / limit),
    reports
  });

});


// GET ALL EXPENSES BY REPORT (ADMIN)
export const getExpensesByReportAdmin = asyncHandler(async (req, res) => {

  const { reportId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, "Invalid report id");
  }

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);

  const skip = (page - 1) * limit;


const { status } = req.query;

const filter = { reportId };

if (status && status !== "ALL") {
  filter.status = status;
}


  const [expenses, totalExpenses] = await Promise.all([
  expenseModel
    .find({
      organizationId,
      ...filter
    })
    .sort({ expenseDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean(),

  expenseModel.countDocuments({
    reportId,
    organizationId
  })
]);


  res.status(200).json({
    success: true,
    page,
    limit,
    totalExpenses,
    totalPages: Math.ceil(totalExpenses / limit),
    expenses
  });
});
