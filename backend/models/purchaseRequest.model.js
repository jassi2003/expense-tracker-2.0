import mongoose from "mongoose";


const raisedBySchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        dept: { type: String, required: true },
        userRef: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel" },
    },
    { _id: false }
);

const purchaseRequestSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },

    description: String,

    category: {
        type: String,
        enum: ["Laptop", "Software", "Office Supplies", "Travel", "Other"]
    },

    quantity: {
        type: Number,
        default: 1
    },

    estimatedCost: {
        type: Number,
        required: true
    },

    currency: {
        type: String,
        default: "INR"
    },


    productLink: String,

    status: {
        type: String,
        enum: [
            "DRAFT",
            "SUBMITTED",
            "APPROVED",
            "REJECTED",
        ],
        default: "DRAFT"
    },

    raisedBy: { type: raisedBySchema, required: true },

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true
    },


    rejectionReason: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("purchaseRequests", purchaseRequestSchema);
