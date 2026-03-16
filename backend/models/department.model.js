import mongoose from "mongoose";

const departmentSchmema = new mongoose.Schema({
      organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true
  },
    departmentName: { type: String, required: true, trim: true, uppercase: true },
    totalBudget: { type: Number, required: true, min: 0, },
    consumedBudget: { type: Number, required: true,default:0,min:0 },
    isActive: {type: Boolean,default: true,},

},{ timestamps: true })

departmentSchmema.index({ organizationId: 1, departmentName: 1 },{ unique: true });



export default mongoose.model("DepartmentModel", departmentSchmema)