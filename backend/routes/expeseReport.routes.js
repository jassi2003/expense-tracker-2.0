import express from "express"
import { createReport,getMyReports,getExpensesByReport } from "../controllers/expenseReport.controller.js"
import authUser from "../middlewares/authUser.js"

const expenseReportRouter=express.Router()

expenseReportRouter.post("/create-report",authUser,createReport)
expenseReportRouter.get("/my-reports",authUser,getMyReports)
expenseReportRouter.get("/expensesInReport/:reportId", authUser, getExpensesByReport);



export default expenseReportRouter