import departmentModel from "../models/department.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";


//  ADD DEPARTMENT
export const addDepartment = asyncHandler(async (req, res) => {
  const { departmentName, totalBudget, isActive } = req.body;

  if (!departmentName ||  totalBudget === null) {
    throw new ApiError(400, "Department name and total budget are required");
  }

  if (isNaN(totalBudget) || Number(totalBudget) < 0) {
    throw new ApiError(400, "Total budget must be a valid positive number");
  }

  const department = await departmentModel.create({
    departmentName: departmentName.trim(),
    totalBudget: Number(totalBudget),
    consumedBudget: 0,
    isActive: isActive ?? true,
  });

  res.status(201).json({
    success: true,
    message: "Department created successfully",
    department,
  });
});


//  GET ALL
export const getAllDepartments = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const departments = await departmentModel
    .find(filter)
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: departments.length,
    departments,
  });
});


// UPDATE
export const updateDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;
  const { departmentName, totalBudget } = req.body;

  const department = await departmentModel.findById(departmentId);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (departmentName) {
    department.departmentName = departmentName.trim();
  }

  if (totalBudget !== undefined) {
    if (totalBudget < department.consumedBudget) {
      throw new ApiError(
        400,
        "Total budget cannot be less than consumed budget"
      );
    }

    department.totalBudget = totalBudget;
  }

  department.updatedAt = new Date();

  await department.save();

  res.status(200).json({
    success: true,
    message: "Department updated successfully",
    department,
  });
});


// ACTIVATE
export const activateDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  const department = await departmentModel.findById(departmentId);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (department.isActive) {
    throw new ApiError(400, "Department already activated");
  }

  department.isActive = true;
  department.updatedAt = new Date();

  await department.save();

  res.status(200).json({
    success: true,
    message: "Department activated successfully",
    department,
  });
});


//  DEACTIVATE
export const deactivateDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  const department = await departmentModel.findById(departmentId);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (!department.isActive) {
    throw new ApiError(400, "Department already deactivated");
  }

  department.isActive = false;
  department.updatedAt = new Date();

  await department.save();

  res.status(200).json({
    success: true,
    message: "Department deactivated successfully",
    department,
  });
});