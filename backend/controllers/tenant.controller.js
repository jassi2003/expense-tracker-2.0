import  Organization from "../models/tenant.model.js"
import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";


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