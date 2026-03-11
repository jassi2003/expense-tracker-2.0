import express from "express"
import { addEmployee, loginUser, getAllUsers, deactivateUser, activateUser, getUserByUserId } from "../controllers/user.controller.js"
import authUser from "../middlewares/authUser.js"

const userRouter = express.Router()

userRouter.post("/login-user", loginUser)
userRouter.post("/add-user",authUser, addEmployee)
userRouter.get("/get-AllUsers", authUser, getAllUsers)
userRouter.put("/deactivate-user/:id", authUser, deactivateUser)
userRouter.put("/activate-user/:id", authUser, activateUser)
userRouter.get("/get-user/:userId", authUser, getUserByUserId)

export default userRouter
