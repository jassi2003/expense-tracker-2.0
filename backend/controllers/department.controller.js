import departmentModel from "../models/department.model.js";


//ADD DEPARTMENTS
export const addDepartment = async (req, res) => {
  try {
    const { departmentName, totalBudget, isActive } = req.body;
console.log("addDepartment request body:", req.body);

    if (!departmentName || totalBudget == null) {
      return res.status(400).json({
        success: false,
        message: "Department name and total budget are required",
      });
    }

    if (isNaN(totalBudget) || Number(totalBudget) < 0) {
      return res.status(400).json({
        success: false,
        message: "Total budget must be a valid positive number",
      });
    }

    const formattedName = departmentName.trim().toUpperCase();

    const existingDept = await departmentModel.findOne({
      departmentName: formattedName,
    });

    if (existingDept) {
      return res.status(409).json({
        success: false,
        message: "Department already exists",
      });
    }

    const department = await departmentModel.create({
      departmentName: formattedName,
      totalBudget: Number(totalBudget),
      consumedBudget: 0, 
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });

  } catch (err) {
    console.error("addDepartment error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to add department",
    });
  }
};


// GET ALL DEPARTMENTS 
export const getAllDepartments = async (req, res) => {
  try {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const departments = await departmentModel
      .find(filter)
      .sort({ createdAt: -1 }) // latest first
      .lean();

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });

  } catch (err) {
    console.error("getAllDepartments error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};
