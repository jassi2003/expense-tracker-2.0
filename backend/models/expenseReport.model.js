import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
{
  employeeId: {
  type:String
  
  },

  reportName: {
    type: String,
    required: true
  },

 date: { type: Date, required: true },


  purpose: {
    type: String
  },

  totalAmount: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"],
    default: "DRAFT"
  },
    organizationId: {type: mongoose.Schema.Types.ObjectId,ref: "Organization",required: true
  }

},
{ timestamps: true }
);

export default mongoose.model("ReportData", reportSchema);