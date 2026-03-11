import express from "express"
import { createOrganization,createAdmin } from "../controllers/tenant.controller.js"
import authUser from "../middlewares/authUser.js"

const tenantRouter=express.Router()

tenantRouter.post("/create-organization",authUser,createOrganization)
tenantRouter.post("/create-admin",authUser,createAdmin)


export default tenantRouter