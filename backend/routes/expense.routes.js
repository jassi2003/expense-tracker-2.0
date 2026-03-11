import express from "express"
import {
    addExpense,
    getMyExpenses,
    getExpenseSummary,
    getTagAnalytics,
    approveExpense, rejectExpense,
    getMonthlyExpenseSummary,
    getAllExpensesAdmin,
    getExpenseById,
    deleteExpense,
    updateExpense,
    getAdminDashboardStats,
    getUserAnalytics,
    getDepartmentAnalytics,
    getOverallAnalytics,
    generateReportController,
    scanReceiptController
} from "../controllers/expense.controller.js"
import authUser from "../middlewares/authUser.js"
import upload from "../middlewares/multer.js"


const expenseRoutes = express.Router()

expenseRoutes.post("/add-expense", authUser, upload.single("receipt"), addExpense)
expenseRoutes.put("/update-expense/:expenseId", authUser, upload.single("receipt"), updateExpense)
expenseRoutes.get("/all-expenses", authUser, getMyExpenses); //getting expenses for logged in user
expenseRoutes.get("/expense-summary", authUser, getExpenseSummary);
expenseRoutes.put("/approve-expense/:expId", authUser, approveExpense);
expenseRoutes.put("/reject-expense/:expId", authUser, rejectExpense)

expenseRoutes.get("/admin-dashboard-stats", authUser, getAdminDashboardStats)
expenseRoutes.get("/report-overall", authUser, getOverallAnalytics)
expenseRoutes.get("/report-department", authUser, getDepartmentAnalytics)
expenseRoutes.get("/report-user", authUser, getUserAnalytics)
expenseRoutes.post("/generate-report", authUser, generateReportController)

expenseRoutes.post("/scan-receipt", authUser,upload.single("receipt"), scanReceiptController)

expenseRoutes.get("/monthly-expense-summary", authUser, getMonthlyExpenseSummary)
expenseRoutes.get("/all-expenses-admin", authUser, getAllExpensesAdmin)
expenseRoutes.get("/expense-by-id/:id", authUser, getExpenseById)
expenseRoutes.delete("/delete-expense/:id", authUser, deleteExpense)
expenseRoutes.get("/tag-analytics", authUser, getTagAnalytics)

export default expenseRoutes