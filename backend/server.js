import express from "express"
import app from "./app.js"
import dotenv from "dotenv"
import connectDb from "./config/mongoDb.js"
import connectCloudinary from "./config/cloudinary.js" 
import { exchangeRateCron } from "./cron/admin.cron.js"


dotenv.config()
connectCloudinary()
async function startServer(){
    try{
await connectDb() 

exchangeRateCron.start(); 


const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log(`server is listening on port ${PORT}`)
})
    }
    catch(err){
console.log("error while connecting with server",err)
    }
}

startServer()