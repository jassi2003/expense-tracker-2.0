import  Organization from "../models/tenant.model.js"
import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

//CREATING ORGANIZATION
export const createOrganization = async (req, res) => {
  try {
    const { orgName,domain,country,industry } = req.body;
    const org = await Organization.create({
      name: orgName,
      domain:domain,
      country:country,
      industry:industry
    });

    res.status(201).json({
      success:true,
      organization: org
    });

  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
};


//CREATING ADMIN FOR ORGANIZATION
export const createAdmin = async (req,res) => {

  if (req.user?.role !== "SUPERADMIN") {
    throw new ApiError(403, "Access denied");
  }
  try{
    const {
      userId,
      name,
      email,
      password,
      organizationId
    } = req.body;

    const hashedPassword = await bcrypt.hash(password,10);

    const admin = await userModel.create({
      userId,
      name: name,
      email: email,
      password: hashedPassword,
      role:"ADMIN",
      organizationId
    });

    res.json({
      success:true,
      admin
    });

  }
  catch(err){
    res.status(500).json({message:err.message})
  }
};


export const getAllOrganizations = asyncHandler(async (req, res) => {

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const organizations = await Organization
    .find()                    
    .sort({ createdAt: -1 }) 
    .skip(skip)
    .limit(limit)
    .lean();                   

  const totalOrganizations = await Organization.countDocuments();

  res.status(200).json({
    success: true,
    page,
    limit,
    totalOrganizations,
    totalPages: Math.ceil(totalOrganizations / limit),
    organizations
  });

});

//Activate the organization
export const activateOrganization = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;

  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    { isActive: true },
    { new: true }
  );

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  res.status(200).json({
    success: true,
    message: "Organization activated successfully",
    organization
  });
});


//DEACTIVE THE ORGANZATION
export const deactivateOrganization = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;

  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    { isActive: false },
    { new: true }
  );

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  res.status(200).json({
    success: true,
    message: "Organization deactivated successfully",
    organization
  });
});


//GET ALL ADMINS
export const getAllAdmins = asyncHandler(async (req, res) => {

  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.max(Number(req.query.limit) || 10, 1)
  const skip = (page - 1) * limit

  // fetch admins
  const admins = await userModel
    .find({ role: "ADMIN" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  const totalAdmins = await userModel.countDocuments({ role: "ADMIN" })

  res.status(200).json({
    success: true,
    page,
    limit,
    totalAdmins,
    totalPages: Math.ceil(totalAdmins / limit),
    admins
  })

})