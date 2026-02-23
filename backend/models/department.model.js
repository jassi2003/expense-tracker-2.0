import mongoose from "mongoose";

const departmentSchmema = new mongoose.Schema({
    departmentName: { type: String, required: true, unique: true, trim: true, uppercase: true },
    totalBudget: { type: Number, required: true, min: 0, },
    consumedBudget: { type: Number, required: true,default:0,min:0 },
    isActive: {type: Boolean,default: true,},

},{ timestamps: true })



export default mongoose.model("DepartmentModel", departmentSchmema)