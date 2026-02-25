import express from "express"
import authUser from "../middlewares/authUser.js"
import { getCurrencyList } from "../controllers/currency.controller.js"


const currencyRouter=express.Router()

currencyRouter.get("/currencyList",authUser,getCurrencyList)

export default currencyRouter