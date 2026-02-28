import mongoose from "mongoose";

const monthlyAdminStatsSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true },

    approved: {
      totalAmount: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    pending: {
      totalAmount: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    rejected: {
      totalAmount: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    deptTotals: {
      type: Map,
      of: Number,
      default: {},
    },

    empTotals: {
      type: Map,
      of: Number,
      default: {},
    },

    topDepartment: {
      department: String,
      totalAmount: { type: Number, default: 0 },
    },

    topEmployee: {
      userId: String,
      totalAmount: { type: Number, default: 0 },
    },

    lastRebuildAt: { type: Date, default: null },
  },

  { timestamps: true }
);

monthlyAdminStatsSchema.index({ year: 1, month: 1 }, { unique: true });

export default mongoose.model("HistoricalAdminStats", monthlyAdminStatsSchema);