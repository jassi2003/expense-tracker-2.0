import mongoose from "mongoose";

import departmentModel from "./models/department.model.js";
import userModel from "./models/user.model.js";
import expenseModel from "./models/expense.model.js";

const MONGO_URI = "mongodb+srv://jaspreetjassisingh2003_db_user:P5I1GqZcmxP9mu5O@cluster0.zsaib3r.mongodb.net/?appName=Cluster0";


const departments = [
  "HR",
  "MARKETING",
  "DEVELOPMENT",
  "SALES",
  "OPERATIONS",
  "FINANCE"
];

const seedMonthlyExpenses = async () => {
  try {

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    // Fetch users from allowed departments
    const users = await userModel.find({
      empdepartment: { $in: departments }
    });

    if (users.length === 0) {
      console.log("No users found");
      process.exit();
    }

    // Fetch departments
    const deptDocs = await departmentModel.find({
      departmentName: { $in: departments }
    });

    const deptMap = {};
    deptDocs.forEach(d => {
      deptMap[d.departmentName] = d;
    });

    const expenses = [];
    const year = 2026;

    for (let month = 0; month < 12; month++) {

      for (let i = 0; i < 20; i++) {

        // pick random user
        const user = users[Math.floor(Math.random() * users.length)];

        const dept = deptMap[user.empdepartment];

        const randomDay = Math.floor(Math.random() * 28) + 1;

        const expenseDate = new Date(year, month, randomDay);

        expenses.push({

          title: "Office Expense",

          currency: "INR",

          amount: 10,

          originalAmount: mongoose.Types.Decimal128.fromString("10"),

          expenseDate,

          tags: ["office", "seed"],

          receipt: "dummy-receipt-url",

          status: "APPROVED",

          exchangeRate: 1,

          raisedBy: {
            userId: user.userId,
            dept: user.empdepartment,
            userRef: user._id
          },

          departmentSnapshot: {
            departmentName: dept.departmentName,
            totalBudget: dept.totalBudget,
            consumedBudget: dept.consumedBudget,
            isActive: dept.isActive
          }

        });

      }

    }

    await expenseModel.insertMany(expenses);

    console.log(`Inserted ${expenses.length} expenses`);

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedMonthlyExpenses();