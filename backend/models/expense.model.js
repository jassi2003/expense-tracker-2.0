import mongoose from "mongoose";



const raisedBySchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        dept: { type: String, required: true },
        userRef: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel" },
    },
    { _id: false }
);


const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    currency: { type: String, required: true, default: "INR" },
    amount: { type: Number, required: true, min: 0 },  //inr amount
    originalAmount: { type: mongoose.Schema.Types.Decimal128, required: true },  //storing orginial amount in orginal currency
    expenseDate: { type: Date, required: true },
    tags: [{ type: String, trim: true }],
    receipt: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    exchangeRate: {
        type: Number, required: true,
    },
    raisedBy: { type: raisedBySchema, required: true },

}, { timestamps: true })

expenseSchema.index({ "raisedBy.userId": 1 });
expenseSchema.index({ "raisedBy.dept": 1 });
expenseSchema.index({ expenseDate: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ createdAt: 1 });


export default mongoose.model("ExpenseModel", expenseSchema);
