// // controllers/admin.controller.js
// import bcrypt from "bcryptjs";
// import userModel from "../models/user.model.js";
// import jwt from "jsonwebtoken"
// import { seedAdminIfMissing } from "../utils/seedAdmin.js";


// //ADD EMPLOYEE
// export const addEmployee = async (req, res) => {
//   try {
//     const { name, email, password, userId, empdepartment, role } = req.body;
//     console.log("user data", req.body)

//     if (!email || !password || !userId || !empdepartment || !name) {
//       return res.status(400).json({ message: "all fields are required" });
//     }

//     const normalizedEmail = email.toLowerCase().trim();
//     const normalizedUserId = userId.toLowerCase().trim();

//     // 1) Checking duplicates
//     // const existing = await userModel.findOne({
//     //   $or: [{ email: normalizedEmail }, { userId: normalizedUserId }],
//     // });

//     // if (existing) {
//     //   return res.status(409).json({ message: "User already exists" });
//     // }

//     // 2) Hashing  password
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);

//     // 3) Createing employee
//     const created = await userModel.create({
//       userId: normalizedUserId,
//       name: name,
//       email: normalizedEmail,
//       empdepartment: empdepartment,
//       password: passwordHash,
//       role: "EMPLOYEE",
//       isActive: true,
//     });

//     return res.status(201).json({
//       message: "Employee created successfully",
//       employee: {
//         id: created._id,
//         userId: created.userId,
//         name: created.name,
//         email: created.email,
//         empdepartment: created.empdepartment,
//         password: created.password,
//         role: created.role,
//         createdAt: created.createdAt,
//       },
//     });
//   } catch (err) {
//     console.error("addEmployee error:", err);
//     return res.status(500).json({ message: "Failed to create employee" });
//   }
// };



// //LOGIN USER
// export const loginUser = async (req, res) => {
//   try {
//     await seedAdminIfMissing()

//     const { email, password } = req.body;
//     const findUser = await userModel.findOne({ email })
//     if (!findUser) {
//       return res.json({
//         success: false,
//         message: "invalid credentials"
//       })
//     }

//     if (findUser.isActive === false) {
//       return res.json({
//         success: false,
//         message: "user is deactivated, contact admin"
//       })
//     }

//     const matchPass = await bcrypt.compare(password, findUser.password)
//     if (matchPass) {
//       const payload = {
//         userId: findUser.userId,
//         role: findUser.role,
//         dept: findUser.empdepartment,
//       };
//       const token = jwt.sign({ payload }, process.env.JWT_SECRET)
//       res.json({
//         success: true,
//         token,
//         userName: findUser.name,
//         message: "user logged in successfully",
//         payload,
//       })
//     }

//     else {
//       return res.json({
//         success: false,
//         message: "invalid credentials"
//       })
//     }

//   }
//   catch (error) {
//     console.log("failed to login user", error)
//     res.json({ success: false, message: error.message })
//   }
// }






// // GET ALL USERS
// export const getAllUsers = async (req, res) => {
//   try {
//     const page = Math.max(parseInt(req.query.page) || 1, 1);
//     const limit = Math.max(parseInt(req.query.limit) || 6, 1);
//     const skip = (page - 1) * limit;

//     // total users count (for total pages)
//     const totalUsers = await userModel.countDocuments();

//     // fetch paginated users (exclude password)
//     const users = await userModel
//       .find()
//       .select("-password")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     if (totalUsers === 0) {
//       return res.status(404).json({ message: "No users found" });
//     }

//     const totalPages = Math.ceil(totalUsers / limit);

//     return res.status(200).json({
//       message: "Users fetched successfully",
//       users,
//       pagination: {
//         totalUsers,
//         totalPages,
//         currentPage: page,
//         limit,
//       },
//     });
//   } catch (err) {
//     console.error("getAllUsers error:", err);
//     return res.status(500).json({ message: "Failed to fetch users" });
//   }
// };


// //INFO OF LOGGEIN IN USER
// export const getUserByUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     const user = await userModel
//       .findOne({ userId: userId })
//       .select("-password"); // exclude password

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "User fetched successfully",
//       user,
//     });

//   } catch (error) {
//     console.error("getUserByUserId error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch user",
//     });
//   }
// };




// //DEACTIVATE USER
// export const deactivateUser = async (req, res) => {
//   try {
//     if (req.user?.role !== "ADMIN") {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     const { id } = req.params;


//     // Validate ID
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     const user = await userModel.findById(id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (!user.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: "User is already deactivated",
//       });
//     }

//     user.isActive = false;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "User deactivated successfully",
//       user: {
//         id: user._id,
//         userId: user.userId,
//         name: user.name,
//         email: user.email,
//         isActive: user.isActive,
//       },
//     });

//   } catch (err) {
//     console.error("deactivateUser error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to deactivate user",
//     });
//   }
// };


// //ACTIVATE USER
// export const activateUser = async (req, res) => {
//   try {
//     if (req.user?.role !== "ADMIN") {
//       return res.status(403).json({ success: false, message: "Access denied" });
//     }

//     const { id } = req.params;
//     // Validate ID
//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "User ID is required",
//       });
//     }

//     const user = await userModel.findById(id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (user.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: "User is already activated",
//       });
//     }

//     user.isActive = true;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "User activated successfully",
//       user: {
//         id: user._id,
//         userId: user.userId,
//         name: user.name,
//         email: user.email,
//         isActive: user.isActive,
//       },
//     });

//   } catch (err) {
//     console.error("deactivateUser error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to deactivate user",
//     });
//   }
// };



// controllers/admin.controller.js

import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { seedAdminIfMissing } from "../utils/seedAdmin.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";


//  ADD EMPLOYEE 
export const addEmployee = asyncHandler(async (req, res) => {
  const { name, email, password, userId, empdepartment } = req.body;

  if (!email || !password || !userId || !empdepartment || !name) {
    throw new ApiError(400, "All fields are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUserId = userId.toLowerCase().trim();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const created = await userModel.create({
    userId: normalizedUserId,
    name,
    email: normalizedEmail,
    empdepartment,
    password: passwordHash,
    role: "EMPLOYEE",
    isActive: true,
  });

  return res.status(201).json({
    message: "Employee created successfully",
    employee: {
      id: created._id,
      userId: created.userId,
      name: created.name,
      email: created.email,
      empdepartment: created.empdepartment,
      password: created.password,
      role: created.role,
      createdAt: created.createdAt,
    },
  });
});


// LOGIN USER 
export const loginUser = asyncHandler(async (req, res) => {
  await seedAdminIfMissing();

  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const findUser = await userModel.findOne({ email });

  if (!findUser) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!findUser.isActive) {
    throw new ApiError(403, "User is deactivated, contact admin");
  }

  const matchPass = await bcrypt.compare(password, findUser.password);

  if (!matchPass) {
    throw new ApiError(401, "Invalid credentials");
  }

  const payload = {
    userId: findUser.userId,
    role: findUser.role,
    dept: findUser.empdepartment,
  };

  const token = jwt.sign({ payload }, process.env.JWT_SECRET);

  return res.json({
    success: true,
    token,
    userName: findUser.name,
    message: "User logged in successfully",
    payload,
  });
});


// GET ALL USERS 
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 6, 1);
  const skip = (page - 1) * limit;

  const totalUsers = await userModel.countDocuments();

  if (totalUsers === 0) {
    throw new ApiError(404, "No users found");
  }

  const users = await userModel
    .find()
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalUsers / limit);

  return res.status(200).json({
    message: "Users fetched successfully",
    users,
    pagination: {
      totalUsers,
      totalPages,
      currentPage: page,
      limit,
    },
  });
});


//GET USER BY USERID 
export const getUserByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await userModel
    .findOne({ userId })
    .select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({
    success: true,
    message: "User fetched successfully",
    user,
  });
});


// DEACTIVATE USER
export const deactivateUser = asyncHandler(async (req, res) => {
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Access denied");
  }

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await userModel.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(400, "User is already deactivated");
  }

  user.isActive = false;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "User deactivated successfully",
    user: {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    },
  });
});


// ACTIVATE USER
export const activateUser = asyncHandler(async (req, res) => {
  if (req.user?.role !== "ADMIN") {
    throw new ApiError(403, "Access denied");
  }

  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await userModel.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isActive) {
    throw new ApiError(400, "User is already activated");
  }

  user.isActive = true;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "User activated successfully",
    user: {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    },
  });
});