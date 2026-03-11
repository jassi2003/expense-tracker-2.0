import mongoose from "mongoose";
import expenseModel from "../models/expense.model.js";
import departmentModel from "../models/department.model.js";
import exchangeRateModel from "../models/exchangeRate.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { v2 as cloudinary } from 'cloudinary'
import { getOverallAnalyticsService } from "../services/analytics.service.js";
import { getDepartmentAnalyticsService } from "../services/analytics.service.js";
import { getUserAnalyticsService } from "../services/analytics.service.js";
import { sendReportJob } from "../services/sqsProducer.service.js";
import expenseReportModel from "../models/expenseReport.model.js";
import axios from "axios";
import fs from "fs";

//ADDING EXPENSE
export const addExpense = asyncHandler(async (req, res) => {
  const { title, amount, expenseDate, tags, currency, reportId } = req.body;

  if (!title || amount == null || !expenseDate || !currency) {
    throw new ApiError(400, "All fields are required");
  }
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }
  
  //validating expenseReport
  let report = null;
   if (reportId) {
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new ApiError(400, "Invalid report id");
  }

  report = await expenseReportModel.findOne({
    _id: new mongoose.Types.ObjectId(reportId),
    employeeId: req.user.userId,
    organizationId
  });

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  if (report.status !== "DRAFT") {
    throw new ApiError(400, "Cannot add expenses to submitted report");
  }
}



  //Validating amount
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

  //validating deparment
  const department = await departmentModel.findOne({
    departmentName: { $regex: `^${req.user.dept}$`, $options: "i" },
    organizationId

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
    reportId: reportId || null,
        organizationId,
    raisedBy: {
      userId: req.user.userId,
      dept: req.user.dept,
    },
    departmentSnapshot: {
      departmentName: department.departmentName,
      totalBudget: department.totalBudget,
      consumedBudget: department.consumedBudget,
      isActive: department.isActive
    },
  });

  if (reportId) {

    await expenseReportModel.findByIdAndUpdate(
      reportId,
              organizationId,
      {
        $inc: { totalAmount: created.amount }
      }
    );

  }


  return res.status(201).json({
    message: "Expense created successfully",
    expense: created,
  });
});



//SCANNING RECEIPT 
export const scanReceiptController = async (req, res) => {
  try {
  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Receipt file required"
      });
    }

    // Convert file to base64
    const base64File = fs.readFileSync(file.path, {
      encoding: "base64",
    });

    const response = await axios.post(
      "https://api.veryfi.com/api/v8/partner/documents/",
      {
        file_name: file.originalname,
        file_data: base64File,
      },
      {
        headers: {
          "CLIENT-ID": process.env.VERYFI_CLIENT_ID,
          AUTHORIZATION: process.env.VERYFI_AUTHORIZATION,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    return res.json({
      success: true,
      extractedData: {
        title: data.vendor?.name || "",
        amount: data.total || 0,
        currency: data.currency_code || "INR",
        expenseDate: data.date || ""
      }
    });

  } catch (error) {
    console.error(error.response?.data || error);

    res.status(500).json({
      success: false,
      message: " OCR failed"
    });
  }
};



//GETTING ALL EXPENSES of LOGGED IN USER
export const getMyExpenses = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }


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
    organizationId
  };

  // Apply status filter
  if (req.query.status) {
    filter.status = req.query.status;
  }

  console.log("getMyExpenses filter:", filter, "page:", page, "limit:", limit);

  // Count total expenses
  const totalExpenses = await expenseModel.countDocuments({
    "raisedBy.userId": userId,
    organizationId
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



// UPDATING THE EXPENSE
export const updateExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    throw new ApiError(400, "Invalid expense ID");
  }

  const expense = await expenseModel.findOne({
    _id: expenseId,
    organizationId
  });


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




//EXPENSE SUMMARY FOR LOGGED IN EMPLOYEE
export const getExpenseSummary = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const organizationId = req.user?.organizationId;

  if (!userId || !organizationId) {
    throw new ApiError(401, "Unauthorized");
  }

  const summary = await expenseModel.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId),
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

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const { expId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(expId)) {
    throw new ApiError(400, "Invalid expense id");
  }

  const expense = await expenseModel.findOne({
    _id: expId,
    organizationId
  });

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
      organizationId,
      $expr: {
        $gte: ["$totalBudget", { $add: ["$consumedBudget", amount] }]
      }
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

  // approving expense with rollback safety
  try {
    expense.status = "APPROVED";
    expense.approvedAt = new Date();
    expense.approvedBy = req.user.userId;

    await expense.save();
  } catch (err) {

    // rollback department budget safely
    await departmentModel.updateOne(
      {
        departmentName: deptKey,
        organizationId
      },
      { $inc: { consumedBudget: -amount } }
    );

    throw err;
  }

  return res.status(200).json({
    success: true,
    message: "Expense approved & budget deducted",
    title: expense.title,
    userId: expense.raisedBy.userId,
    department: expense.raisedBy.dept,
    status: expense.status,
    ExpenseAmount: expense.amount,
    departmentBudget: {
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

  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }


  const expense = await expenseModel.findOne({
    _id: expId,
    organizationId
  });

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



// REPORT GENERATION FOR DASHBOARD
// //overall monthly stats
export const getOverallAnalytics = asyncHandler(async (req, res) => {
  const { fromDate, toDate } = req.query;

 const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }


  const data = await getOverallAnalyticsService({ fromDate, toDate,organizationId })

  res.json({
    success: true,
    totalMonths: data.length,
    data
  });
});


//getdepartmernt analytics
export const getDepartmentAnalytics = asyncHandler(async (req, res) => {
  const { fromDate, toDate, page = 1, limit = 10 } = req.query;


  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const result = await getDepartmentAnalyticsService({
    fromDate,
    toDate,
    page: Number(page),
    limit: Number(limit),
    paginate: true,
    organizationId
  });
  res.json({
    success: true,
    ...result
  });
});


//get user analytics
export const getUserAnalytics = asyncHandler(async (req, res) => {

  const { fromDate, toDate, dept, page = 1, limit = 10 } = req.query;

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const result = await getUserAnalyticsService({
    fromDate,
    toDate,
        organizationId,
    dept,
    page: Number(page),
    limit: Number(limit),
    paginate: true
  })


  return res.json({
    success: true,
    ...result
  })

});



//GENERATING ADMIN STATS
export const getAdminDashboardStats = asyncHandler(async (req, res) => {

  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Access denied");
  }

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

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
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId)
      }
    },

    {
      $facet: {

        approvedThisMonth: [
          {
            $match: {
              status: "APPROVED",
              expenseDate: { $gte: startOfMonth, $lt: startOfNextMonth }
            }
          },
          {
            $group: {
              _id: null,
              totalApprovedAmount: { $sum: "$amount" },
              approvedCount: { $sum: 1 }
            }
          }
        ],

        pendingThisMonth: [
          {
            $match: {
              status: "PENDING",
              expenseDate: { $gte: startOfMonth, $lt: startOfNextMonth }
            }
          },
          {
            $group: {
              _id: null,
              pendingCount: { $sum: 1 },
              pendingAmount: { $sum: "$amount" }
            }
          }
        ],

        topDepartment: [
          {
            $match: {
              status: "APPROVED",
              expenseDate: { $gte: startOfMonth, $lt: startOfNextMonth }
            }
          },
          {
            $group: {
              _id: "$raisedBy.dept",
              total: { $sum: "$amount" },
              count: { $sum: 1 }
            }
          },
          { $sort: { total: -1 } },
          { $limit: 1 }
        ],

        topEmployee: [
          {
            $match: {
              status: "APPROVED",
              expenseDate: { $gte: startOfMonth, $lt: startOfNextMonth }
            }
          },
          {
            $group: {
              _id: "$raisedBy.userId",
              total: { $sum: "$amount" },
              count: { $sum: 1 }
            }
          },
          { $sort: { total: -1 } },
          { $limit: 1 }
        ]

      }
    }
  ]);

  const result = stats?.[0] || {};

  const approvedThisMonth = result.approvedThisMonth?.[0] || {
    totalApprovedAmount: 0,
    approvedCount: 0
  };

  const pendingThisMonth = result.pendingThisMonth?.[0] || {
    pendingCount: 0,
    pendingAmount: 0
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
      approvedCount: approvedThisMonth.approvedCount || 0
    },
    pending: {
      pendingCount: pendingThisMonth.pendingCount || 0,
      pendingAmount: pendingThisMonth.pendingAmount || 0
    },
    topDepartment: topDepartment
      ? {
          department: topDepartment._id,
          total: topDepartment.total,
          count: topDepartment.count
        }
      : null,
    topEmployee: topEmployee
      ? {
          userId: topEmployee._id,
          total: topEmployee.total,
          count: topEmployee.count
        }
      : null,
    generatedAt: new Date()
  });

});




//MONTH WISE EXPENSES TOTALS(FOR ADMIN)
export const getMonthlyExpenseSummary = asyncHandler(async (req, res) => {

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const now = new Date();
  const year = Number(req.query.year) || now.getFullYear();

  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const statusFilter = "APPROVED";

  const result = await expenseModel.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        status: statusFilter,
        expenseDate: { $gte: start, $lt: end }
      }
    },
    {
      $group: {
        _id: { $month: "$expenseDate" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const map = new Map(result.map((r) => [r._id, r]));

  const data = months.map((m, idx) => {
    const monthIndex = idx + 1;
    const row = map.get(monthIndex);

    return {
      month: m,
      totalAmount: row?.totalAmount || 0,
      count: row?.count || 0
    };
  });

  return res.status(200).json({
    success: true,
    year,
    status: statusFilter,
    data,
    generatedAt: new Date()
  });

});



//GET ALL EXPENSES
export const getAllExpensesAdmin = asyncHandler(async (req, res) => {

  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Access denied");
  }

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const requestedLimit = parseInt(req.query.limit) || 6;
  const limit = Math.min(Math.max(requestedLimit, 1), 50);
  const skip = (page - 1) * limit;

  const status = req.query.status;

  const filter = {
    organizationId
  };

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
    success: true,
    expenses,
    pagination: {
      totalExpenses,
      totalPages,
      currentPage: page,
      limit
    }
  });

});


//GET EXEPSNSE BY ID
export const getExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid expense ID");
  }

  const expense = await expenseModel.findOne({
    _id: id,
    organizationId
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  return res.status(200).json({
    success: true,
    message: "Expense fetched successfully",
    expense,
  });
});


//DELETE EXPENSE
export const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid expense ID");
  }

  const expense = await expenseModel.findOne({
    _id: id,
    organizationId
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  // Admin can delete any expense in their organization
  if (req.user.role === "ADMIN") {
    await expenseModel.deleteOne({ _id: id, organizationId });

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully by Admin",
    });
  }

  // Employee can delete ONLY their own expense
  if (req.user.role === "EMPLOYEE") {

    if (expense.raisedBy.userId !== req.user.userId) {
      throw new ApiError(403, "You can only delete your own expenses");
    }

    await expenseModel.deleteOne({ _id: id, organizationId });

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  }

  throw new ApiError(403, "Unauthorized action");
});



//Tags STATS FOR USER DASHBOARD
export const getTagAnalytics = asyncHandler(async (req, res) => {

  const userId = req.user?.userId;
  const organizationId = req.user?.organizationId;

  if (!userId || !organizationId) {
    throw new ApiError(401, "Unauthorized");
  }

  const analytics = await expenseModel.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        "raisedBy.userId": userId
      }
    },
    {
      $unwind: "$tags"
    },
    {
      $group: {
        _id: "$tags",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalAmount: -1 }
    },
    {
      $limit: 5
    }
  ]);

  return res.status(200).json({
    success: true,
    analytics
  });

});




//REPORT GENERATION FOR ADMIN
export const generateReportController = async (req, res) => {

  const { fromDate, toDate, email } = req.query;

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const messageId = await sendReportJob({
    fromDate,
    toDate,
    email,
    organizationId
  });

  res.json({
    success: true,
    message: "Report generation started",
    jobId: messageId
  });

};














