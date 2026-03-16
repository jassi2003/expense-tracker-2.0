import mongoose from "mongoose"




const userSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true,unique:true },
    password: { type: String, required: true },
    empdepartment: { type: String },
    role: {
        type: String,
        enum: ["SUPERADMIN", "ADMIN", "EMPLOYEE"],
        required: true
    },

    isActive: { type: Boolean, default: true },

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
    }

})


userSchema.index({ organizationId: 1, userId: 1 },{ unique: true });
userSchema.index({organization:1, isActive: 1 });

export default mongoose.model("UserModel", userSchema);
