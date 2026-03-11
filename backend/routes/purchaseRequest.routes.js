import express from "express"
import { raisePurchaseRequest,getMyPurchaseRequests,getAllPurchaseRequests,approvePurchaseRequest,rejectPurchaseRequest,editPurchaseRequest,deletePurchaseRequest,submitPurchaseRequest } from "../controllers/purchaseRequests.controller.js"
import authUser from "../middlewares/authUser.js"

const purchaseRequestRouter=express.Router()

purchaseRequestRouter.post("/raisePurchaseRequest",authUser,raisePurchaseRequest)
purchaseRequestRouter.get("/myPurchaseRequest",authUser,getMyPurchaseRequests)
purchaseRequestRouter.get("/allPurchaseReq",authUser,getAllPurchaseRequests)
purchaseRequestRouter.put("/editPurchaseReq/:id",authUser,editPurchaseRequest)
purchaseRequestRouter.delete("/deletePurchaseReq/:id",authUser,deletePurchaseRequest)
purchaseRequestRouter.put("/approvePurchaseReq/:id",authUser,approvePurchaseRequest)
purchaseRequestRouter.put("/rejectPurchaseReq/:id",authUser,rejectPurchaseRequest)
purchaseRequestRouter.put("/submitPurchaseReq/:id",authUser,submitPurchaseRequest)




export default purchaseRequestRouter
