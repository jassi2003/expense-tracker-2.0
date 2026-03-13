import express from "express"
import { createOrganization,createAdmin,getAllOrganizations,activateOrganization,deactivateOrganization,getAllAdmins } from "../controllers/tenant.controller.js"
import authUser from "../middlewares/authUser.js"

const tenantRouter=express.Router()

tenantRouter.post("/create-organization",authUser,createOrganization)
tenantRouter.post("/create-admin",authUser,createAdmin)

tenantRouter.get("/get-organizations",authUser,getAllOrganizations)

tenantRouter.put("/deactivate-organization/:organizationId",authUser,deactivateOrganization)
tenantRouter.put("/activate-organization/:organizationId",authUser,activateOrganization)

tenantRouter.get("/get-admin",authUser,getAllAdmins)




export default tenantRouter