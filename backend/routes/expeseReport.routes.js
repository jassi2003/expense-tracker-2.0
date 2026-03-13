import express from "express"
import { createReport,getMyReports,getExpensesByReport,deleteDraftReport,submitReport,getAllReports,getExpensesByReportAdmin,reviewExpense } from "../controllers/expenseReport.controller.js"
import authUser from "../middlewares/authUser.js"
import { getAllExpensesAdmin } from "../controllers/expense.controller.js"

const expenseReportRouter=express.Router()

expenseReportRouter.post("/create-report",authUser,createReport)
expenseReportRouter.get("/my-reports",authUser,getMyReports)
expenseReportRouter.get("/myExpensesInReport/:reportId", authUser, getExpensesByReport);
expenseReportRouter.delete("/delete-report/:reportId", authUser, deleteDraftReport);
expenseReportRouter.put("/submit-report/:reportId", authUser, submitReport);
expenseReportRouter.get("/all-reports", authUser, getAllReports);
expenseReportRouter.get("/all-expenses/:reportId", authUser, getExpensesByReportAdmin);
expenseReportRouter.put("/review-expense/:expenseId", authUser, reviewExpense);




export default expenseReportRouter