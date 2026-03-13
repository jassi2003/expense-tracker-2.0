import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import Organization from "../models/tenant.model.js"


const authUser = async (req, res, next) => {

  try {

    const { token } = req.headers

    if (!token) {
      throw new ApiError(401, "Not authorized")
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = decoded.payload

    // check organization status
    if (req.user.organizationId) {

      const organization = await Organization
        .findById(req.user.organizationId)
        .select("isActive")

      if (!organization || !organization.isActive) {
        throw new ApiError(403, "Organization is inactive")
      }

    }

    next()

  } catch (error) {

    res.status(error.statusCode || 401).json({
      success: false,
      message: error.message
    })

  }

}

export default authUser
