import mongoose from "mongoose";



const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  
  domain: String,

  industry: String,

  country: String,

  isActive: { type: Boolean, default: true }
}, { timestamps: true });


 organizationSchema.index({ name: 1 }, { unique: true })

export default mongoose.model("organizations", organizationSchema);