import expenseReportModel from "../models/expenseReport.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import expenseModel from "../models/expense.model.js";

//CREATE EXPENSE REPORT 
export const createReport =asyncHandler( async (req, res) => {

  try {

    const { reportName, purpose,date } = req.body;
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
      organizationId
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

    const reports =await expenseReportModel.find({
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


//GETTING ALL EXPENSES IN THAT REPORT OF LOGGED IN USER
export const getExpensesByReport = asyncHandler(async (req, res) => {

  const { reportId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, "Invalid report id");
  }

  // check report belongs to logged employee
  const report = await expenseReportModel.findOne({
    _id: reportId,
    employeeId: req.user.userId,
    organizationId : req.user?.organizationId
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  const expenses = await expenseModel
    .find({ reportId })
    .sort({ expenseDate: -1 });

  return res.status(200).json({
    success: true,
    reportName: report.title,
    totalAmount: report.totalAmount,
    expenses
  });

});
