import expenseReportModel from "../models/expenseReport.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import expenseModel from "../models/expense.model.js";
import ApiError from "../utils/ApiError.js";

//CREATE EXPENSE REPORT 
export const createReport = asyncHandler(async (req, res) => {

  try {

    const { reportName, purpose, date } = req.body;
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      throw new ApiError(401, "Organization not found in token");
    }


    const report = await expenseReportModel.create({
      employeeId: req.user.userId,
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

    const reports = await expenseReportModel.find({
      employeeId: req.user.userId,
      organizationId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      reports
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

  // pagination params
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const report = await expenseReportModel.findOne({
    _id: reportId,
    employeeId,
    organizationId
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  // fetch paginated expenses
  const expenses = await expenseModel
    .find({ reportId })
    .sort({ expenseDate: -1 })
    .skip(skip)
    .limit(limit);

  // total count
  const totalExpenses = await expenseModel.countDocuments({ reportId });

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

    const report = await expenseReportModel.findById(reportId).session(session);

    if (!report) {
      throw new ApiError(404, "Report not found");
    }

    if (report.status !== "DRAFT") {
      throw new ApiError(400, "Only draft reports can be deleted");
    }

    await expenseModel.deleteMany({ reportId }).session(session);

    await expenseReportModel.findByIdAndDelete(reportId).session(session);

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

  const employeeId = req.user.userId;
  const organizationId = req.user?.organizationId;

  const report = await expenseReportModel.findOne({
    _id: reportId,
    employeeId,
    organizationId
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

  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    throw new ApiError(400, "Invalid expense id");
  }
  const allowedActions = ["APPROVED", "REJECTED", "FLAGGED"];

  if (!allowedActions.includes(action)) {
    throw new ApiError(400, "Invalid action");
  }

  const expense = await expenseModel.findById(expenseId);

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  if (expense.status !== "PENDING") {
    throw new ApiError(400, "Only PENDING expenses can be reviewed");
  }

  expense.status = action;

  if (action === "FLAGGED") {
    expense.flagReason = reason || "Requires correction";
  }

  await expense.save();

  // Update report status automatically
  const reportExpenses = await expenseModel.find({
    reportId: expense.reportId
  });

  const statuses = reportExpenses.map(e => e.status);

  let reportStatus = "SUBMITTED";

  if (statuses.every(s => s === "APPROVED")) {
    reportStatus = "APPROVED";
  }

  if (statuses.every(s => s === "REJECTED")) {
    reportStatus = "REJECTED";
  }

  if (statuses.includes("FLAGGED")) {
    reportStatus = "FLAGGED";
  }

  await expenseReportModel.findByIdAndUpdate(
    expense.reportId,
    { status: reportStatus }
  );

  res.status(200).json({
    success: true,
    message: `Expense ${action.toLowerCase()} successfully`
  });
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
 }) // important for multi-tenant
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


  const expenses = await expenseModel
    .find({
      ...filter,
      organizationId
    })
    .sort({ expenseDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalExpenses = await expenseModel.countDocuments({
    reportId,
    organizationId
  });

  res.status(200).json({
    success: true,
    page,
    limit,
    totalExpenses,
    totalPages: Math.ceil(totalExpenses / limit),
    expenses
  });

});