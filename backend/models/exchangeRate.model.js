import mongoose from "mongoose";

const exchangeRateSchema = new mongoose.Schema({
  base: {
    type: String,
    default: "INR",
  },
  rates: {
    type: Map,
    of: Number,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

exchangeRateSchema.index({ base: 1 });

export default mongoose.model("ExchangeRate", exchangeRateSchema);