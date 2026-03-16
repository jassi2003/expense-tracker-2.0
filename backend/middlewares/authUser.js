import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import Organization from "../models/tenant.model.js";

const authUser = async (req, res, next) => {
  try {

    const token = req.headers.token;

    if (!token) {
      throw new ApiError(401, "Token not provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.payload;

    // Check organization status
    if (req.user.organizationId) {

      const organization = await Organization
        .findById(req.user.organizationId)
        .select("isActive");

      if (!organization || !organization.isActive) {
        throw new ApiError(403, "Organization is inactive");
      }

    }

    next();

  } catch (error) {

    // Token expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired, please login again"
      });
    }

    // Invalid token
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    res.status(error.statusCode || 401).json({
      success: false,
      message: error.message
    });

  }
};

export default authUser;