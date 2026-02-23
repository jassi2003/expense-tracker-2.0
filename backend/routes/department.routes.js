import express from "express"
import { addDepartment,getAllDepartments } from "../controllers/department.controller.js"
import authUser from "../middlewares/authUser.js"

const departmentRouter=express.Router()

departmentRouter.post("/add-department",authUser,addDepartment)
departmentRouter.get("/get-department",authUser,getAllDepartments)

export default departmentRouter