import express from "express"
import { addExpense,
    getMyExpenses,
    getExpenseSummary,
    getTagAnalytics,
    approveExpense,rejectExpense,
    generateAdminReport,
    getAdminDashboardStats,
    getMonthlyExpenseSummary,
    getAllExpensesAdmin,
    getExpenseById,
    deleteExpense,
    updateExpense} from "../controllers/expense.controller.js"
import authUser from "../middlewares/authUser.js"
import upload from "../middlewares/multer.js"


const expenseRoutes=express.Router()

expenseRoutes.post("/add-expense",authUser,upload.single("receipt"),addExpense)
expenseRoutes.put("/update-expense/:expenseId",authUser,upload.single("receipt"),updateExpense)
expenseRoutes.get("/all-expenses", authUser, getMyExpenses); //getting expenses for logged in user
expenseRoutes.get("/expense-summary", authUser, getExpenseSummary);
expenseRoutes.put("/approve-expense/:expId", authUser, approveExpense);
expenseRoutes.put("/reject-expense/:expId",authUser,rejectExpense)
expenseRoutes.get("/admin-report",authUser,generateAdminReport)
expenseRoutes.get("/admin-dashboard-stats",authUser,getAdminDashboardStats)
expenseRoutes.get("/monthly-expense-summary",authUser,getMonthlyExpenseSummary)
expenseRoutes.get("/all-expenses-admin",authUser,getAllExpensesAdmin)
expenseRoutes.get("/expense-by-id/:id",authUser,getExpenseById)
expenseRoutes.delete("/delete-expense/:id",authUser,deleteExpense)
expenseRoutes.get("/tag-analytics",authUser,getTagAnalytics)



export default expenseRoutes