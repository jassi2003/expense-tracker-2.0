import mongoose from "mongoose";
import userModel from "./models/user.model.js";
import bcrypt from "bcrypt";

const MONGO_URI = "mongodb+srv://jaspreetjassisingh2003_db_user:P5I1GqZcmxP9mu5O@cluster0.zsaib3r.mongodb.net/?appName=Cluster0";

const departments = [
  "HR",
  "MARKETING",
  "DEVELOPMENT",
  "SALES",
  "OPERATIONS",
  "FINANCE"
];

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    let users = [];

    const hashedPassword = await bcrypt.hash("Test@123", 10);

    departments.forEach((dept) => {
      for (let i = 1; i <= 10; i++) {
        users.push({
          userId: `${dept}_${Date.now()}_${i}`,  // guaranteed unique
          name: `${dept}_User_${i}`,
          email: `${dept.toLowerCase()}user${i}_${Date.now()}@test.com`,
          password: hashedPassword,
          empdepartment: dept,
          role: "EMPLOYEE",
          isActive: true
        });
      }
    });

    await userModel.insertMany(users, { ordered: false });

    console.log("Users Inserted Successfully");
    process.exit();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

seedUsers();