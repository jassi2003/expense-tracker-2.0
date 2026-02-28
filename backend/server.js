import express from "express"
import app from "./app.js"
import dotenv from "dotenv"
import connectDb from "./config/mongoDb.js"
import connectCloudinary from "./config/cloudinary.js" 
import { startExchangeCron } from "./services/exchangeRate.service.js"
// import { rebuildAdminStats } from "./services/rebuidAdminStats.service.js"
import { adminStatsCron } from "./cron/adminStats.cron.js"

dotenv.config()
connectCloudinary()
async function startServer(){
    try{
await connectDb() 
startExchangeCron();
adminStatsCron.start(); // Start the resilient monthly stats rebuild cron

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











// import express from "express"
// import app from "./app.js"
// import dotenv from "dotenv"
// import connectDb from "./config/mongoDb.js"
// import connectCloudinary from "./config/cloudinary.js" 
// import { startExchangeCron } from "./services/exchangeRate.service.js"
// import { adminStatsCron } from "./cron/adminStats.cron.js"

// dotenv.config()
// connectCloudinary()
// async function startServer(){
//     try{
// await connectDb() 
// startExchangeCron();
// adminStatsCron.start(); // Start the resilient monthly stats rebuild cron
// const PORT=process.env.PORT
// app.listen(PORT,()=>{
//     console.log(`server is listening on port ${PORT}`)
// })
//     }
//     catch(err){
// console.log("error while connecting with server",err)
//     }
// }

// startServer()