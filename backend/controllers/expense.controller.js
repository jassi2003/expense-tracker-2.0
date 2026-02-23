import expenseModel from "../models/expense.model.js";
import departmentModel from "../models/department.model.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary'


//ADDDING EXPENSE
export const addExpense = async (req, res) => {
  try {
    const { title, amount, expenseDate, tags } = req.body;
console.log("Received addExpense request with data:", req.body);  //console
    if (!title || amount == null || !expenseDate) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Receipt file is required",
      });
    }

    //  Upload file to Cloudinary
   const uploadResult = await cloudinary.uploader.upload(
  req.file.path,
  {
    folder: "expenses",
  }
);

    const receiptUrl = uploadResult.secure_url;


// Parse tags properly
let parsedTags = [];

if (tags) {
  try {
    parsedTags = JSON.parse(tags).map((tag) => {
      const clean = tag.trim().toLowerCase();
      return clean.startsWith("#") ? clean : `#${clean}`;
    });
  } catch (err) {
    parsedTags = [];
  }
}

    // Create expense
    const created = await expenseModel.create({
      title: title.trim(),
      amount: Number(amount),
      expenseDate: new Date(expenseDate),
      tags: parsedTags,
      receipt: receiptUrl, //  store cloudinary URL
      raisedBy: {
        userId: req.user.userId,
        dept: req.user.dept,
      },
    });

    return res.status(201).json({
      message: "Expense created successfully",
      expense: created,
    });

  } catch (err) {
    console.error("addExpense error:", err);
    return res.status(500).json({
      message: "Failed to create expense",
    });
  }
};


//GETTING ALL EXPENSES by LOGGED IN USER
export const getMyExpenses = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Pagination query params
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const requestedLimit = parseInt(req.query.limit) || 6;
    const limit = Math.min(Math.max(requestedLimit, 1), 50); // max 50
    const skip = (page - 1) * limit;


      const filter = {
      "raisedBy.userId": userId,
    };

    //  APPLY STATUS FILTER
    if (req.query.status) {
      filter.status = req.query.status;
    }
    console.log("getMyExpenses filter:", filter, "page:", page, "limit:", limit); //console

    //  Count total expenses for this user
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

    // Fetch paginated data
    const expenses = await expenseModel
      .find(filter)
      .sort({ expenseDate: -1 })
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

  } catch (error) {
    console.error("getMyExpenses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenses",
    });
  }
};



//UPDATING THE EXPENSE
export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
    }

    const expense = await expenseModel.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Only allow update if expense is pending
    if (expense.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending expenses can be updated",
      });
    }

    // Allow only owner or admin
    if (
      req.user.role !== "ADMIN" &&
      expense.raisedBy.userId !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this expense",
      });
    }

    const { title, currency, amount, expenseDate, tags } = req.body;

    // Update basic fields if provided
    if (title) expense.title = title.trim();
    if (currency) expense.currency = currency;
    if (amount != null) {
      if (Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }
      expense.amount = Number(amount);
    }

    if (expenseDate) {
      expense.expenseDate = new Date(expenseDate);
    }

if (tags) {
  try {
    const parsedTags = JSON.parse(tags);

    expense.tags = [
      ...new Set(
        parsedTags.map((tag) => {
          const clean = tag.trim().toLowerCase();
          return clean.startsWith("#") ? clean : `#${clean}`;
        })
      ),
    ];
  } catch (err) {
    expense.tags = [];
  }
}

    //  receipt file uploaded
    if (req.file) {
         const uploadResult = await cloudinary.uploader.upload(
  req.file.path,
  {
    folder: "expenses",
  }
);
      expense.receipt = uploadResult.secure_url;
    }

    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });

  } catch (error) {
    console.error("updateExpense error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update expense",
    });
  }
};



//EXPENSE SUMMARY
export const getExpenseSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const summary = await expenseModel.aggregate([
      //  Match only logged-in user's expenses
      {
        $match: {
          "raisedBy.userId": userId,
        },
      },

      //  Group everything
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },

          approved: {
            $sum: {
              $cond: [
                { $eq: ["$status", "APPROVED"] },
                "$amount",
                0,
              ],
            },
          },

          pending: {
            $sum: {
              $cond: [
                { $eq: ["$status", "PENDING"] },
                "$amount",
                0,
              ],
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


    //  Calculating monthly average in Node
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
  } catch (error) {
    console.error("getExpenseSummary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch summary",
    });
  }
};


//APPROVING THE EXPENSE
export const approveExpense = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { expId } = req.params;

    // Fetching expense
    const expense = await expenseModel.findById(expId);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.status === "APPROVED") {
      return res.status(400).json({ success: false, message: "Expense already approved" });
    }
    if (expense.status === "REJECTED") {
      return res.status(400).json({ success: false, message: "Rejected expense cannot be approved" });
    }

    const deptKey = (expense.raisedBy?.dept || "").trim().toUpperCase();
    const amount = Number(expense.amount);

    if (!deptKey) {
      return res.status(400).json({ success: false, message: "Department missing in expense" });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid expense amount" });
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
      return res.status(400).json({
        success: false,
        message: "Not enough budget to approve this expense OR department not found",
      });
    }

    //Approving the expense
    try {
      expense.status = "APPROVED";
      expense.approvedAt = new Date();
      expense.approvedBy = req.user.userId;
      await expense.save();
    } catch (err) {
      //  rollback: refund budget
      await departmentModel.updateOne(
        { departmentName: deptKey },
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
      status:expense.status,
      ExpenseAmount:expense.amount,
      department: {
        departmentName: updatedDept.departmentName,
        totalBudget: updatedDept.totalBudget,
        consumedBudget: updatedDept.consumedBudget,
        remainingBudget: updatedDept.totalBudget - updatedDept.consumedBudget,
      },
    });
  } catch (err) {
    console.error("approveExpense error:", err);
    return res.status(500).json({ success: false, message: "Failed to approve expense" });
  }
};


//REJECT EXEPENSE
export const rejectExpense = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { expId } = req.params;

    const expense = await expenseModel.findById(expId);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.status === "REJECTED") {
      return res.status(400).json({ success: false, message: "Expense already rejected" });
    }
    if (expense.status === "APPROVED") {
      return res.status(400).json({ success: false, message: "Approved expense cannot be rejected" });
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
      status:expense.status,
      amount:expense.amount,
    });
  } catch (err) {
    console.error("rejectExpense error:", err);
    return res.status(500).json({ success: false, message: "Failed to reject expense" });
  }
};


//GENERATING ADMIN REPORT 
export const generateAdminReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const matchStage = {
      status: "APPROVED", // only approved expenses
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

    const result = report[0];

    res.json({
      success: true,
      fromDate: startDate,
      toDate: endDate,
      totalExpenseAmt: result.overall[0]?.totalExpenseAmt || 0,
      ExpenseCount: result.overall[0]?.ExpenseCount || 0,
      byDepartment: result.byDepartment,
      byEmployee: result.byEmployee,
      generatedAt: new Date(),
    });

  } catch (error) {
    console.error("Admin report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
    });
  }
};


//GENERATING ADMIN STATS
export const getAdminDashboardStats = async (req, res) => {
  try {
    //  read month/year from query (optional)
    const now = new Date();
    const month = Number(req.query.month) || (now.getMonth() + 1); // 1-12
    const year = Number(req.query.year) || now.getFullYear();

    if (month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: "month must be between 1 and 12" });
    }

    //  selected month range
    const startOfMonth = new Date(year, month - 1, 1);
    const startOfNextMonth = new Date(year, month, 1);

    const stats = await expenseModel.aggregate([
      {
        $facet: {
          // 1) Total Approved (Selected Month)
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

          // 2) Pending (Selected Month
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

          // 3) Top Department (Selected Month)
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

          // 4) Top Employee (Selected Month)
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
        ? { department: topDepartment._id, total: topDepartment.total, count: topDepartment.count }
        : null,
      topEmployee: topEmployee
        ? { userId: topEmployee._id, total: topEmployee.total, count: topEmployee.count }
        : null,
      generatedAt: new Date(),
    });
  } catch (err) {
    console.error("getAdminDashboardStats error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};



//MONTH WISE EXPENSES TOTALS
export const getMonthlyExpenseSummary = async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();

    const start = new Date(year, 0, 1);      // Jan 1
    const end = new Date(year + 1, 0, 1);    // Jan 1 next year


    const statusFilter = req.query.status || "APPROVED";

    const result = await expenseModel.aggregate([
      {
        $match: {
          status: statusFilter, // "APPROVED" by default
          // choose your date field: expenseDate or createdAt
          expenseDate: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { $month: "$expenseDate" }, // 1-12
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Build fixed 12-month array so chart always shows all months
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
  } catch (err) {
    console.error("getMonthlyExpenseSummary error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch monthly expense summary",
    });
  }
};



//GET ALL EXPENSES
export const getAllExpensesAdmin = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const requestedLimit = parseInt(req.query.limit) || 6;
    const limit = Math.min(Math.max(requestedLimit, 1), 50);
    const skip = (page - 1) * limit;

    //  Status filter
    const status = req.query.status; // PENDING | APPROVED | REJECTED

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
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

//GET EXEPSNSE BY ID
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    //  Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }

    //  Finding expense
    const expense = await expenseModel.findById(id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      message: "Expense fetched successfully",
      expense,
    });

  } catch (error) {
    console.error("Get Expense By ID Error:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


//DELETE EXPENSE
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid expense ID",
      });
    }

    const expense = await expenseModel.findById(id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
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
        return res.status(403).json({
          message: "You can only delete your own expenses",
        });
      }

      //allow delete only if PENDING
      // if (expense.status !== "PENDING") {
      //   return res.status(400).json({
      //     message: "Only pending expenses can be deleted",
      //   });
     // }

      await expenseModel.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Expense deleted successfully",
      });
    }

    // Fallback safety
    return res.status(403).json({
      message: "Unauthorized action",
    });

  } catch (error) {
    console.error("Delete Expense Error:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

//Tags STATS
export const getTagAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

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
    ]);

    return res.status(200).json({
      success: true,
      analytics,
    });

  } catch (error) {
    console.error("Tag analytics error:", error);
    res.status(500).json({ message: "Failed to fetch tag analytics" });
  }
};

