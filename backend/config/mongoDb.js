import mongoose from "mongoose";


async function connectDb(){
    try{
await mongoose.connect(process.env.MONGODB_URI)
console.log("successfully connected to mongodb")
    }
    catch(err){
console.log("error while connecting with DB",err)
    }
}


export default connectDb;