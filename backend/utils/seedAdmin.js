import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";


function requireEnv(name) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env var: ${name}`);
    return v;
}

export async function seedAdminIfMissing() {
    try {
         const userId = requireEnv("ADMIN_USERID");
  const name = requireEnv("ADMIN_NAME");
  const email = requireEnv("ADMIN_EMAIL").toLowerCase();
  const password = requireEnv("ADMIN_PASSWORD");

        const existingAdmin = await userModel.findOne({ role: "ADMIN" }).lean();

        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            const adminSeed = await userModel.create({
                userId,
                name,
                email,
                password: hashed,
                role: "ADMIN",
                isActive: true,
            });
            console.log(" Admin seeded in MongoDB");


            return res.status(201).json({
                message: "Admin seeded successfully",
                data: adminSeed,
                success: true
            })
        }
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

    return true;
}
