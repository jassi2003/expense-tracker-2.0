import express from "express"
import { addDepartment,getAllDepartments,deactivateDepartment,updateDepartment,activateDepartment } from "../controllers/department.controller.js"
import authUser from "../middlewares/authUser.js"

const departmentRouter=express.Router()

departmentRouter.post("/add-department",authUser,addDepartment)
departmentRouter.get("/get-department",authUser,getAllDepartments)

departmentRouter.put("/update-department/:departmentId",authUser,updateDepartment)
departmentRouter.put("/activate-department/:departmentId",authUser,activateDepartment)
departmentRouter.put("/deactivate-department/:departmentId",authUser,deactivateDepartment)

export default departmentRouter