import mongoose from "mongoose"

const userSchema=new mongoose.Schema({
    userId:{type:String,required:true},
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    empdepartment:{type:String},
    role:{type:String,enum:["ADMIN","EMPLOYEE"],default:"EMPLOYEE"},  
    isActive: { type: Boolean, default: true }

})


userSchema.index({ userId: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isActive: 1 });

export default mongoose.model("UserModel", userSchema);
