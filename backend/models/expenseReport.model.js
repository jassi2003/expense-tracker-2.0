import mongoose from "mongoose";


const raisedBySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    dept: { type: String, required: true },
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel" },
  },
  { _id: false }
);




const reportSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String

    },

    reportName: {
      type: String,
      required: true
    },

    raisedBy: { type: raisedBySchema, required: true },


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
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "FLAGGED"],
      default: "DRAFT"
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true
    },
    flagReason: String,


  },
  { timestamps: true }
);

export default mongoose.model("ReportData", reportSchema);