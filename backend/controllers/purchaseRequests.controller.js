import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import purchaseRequestModel from "../models/purchaseRequest.model.js";



//RAISE PURCHASE REQUEST
export const raisePurchaseRequest = asyncHandler(async (req, res) => {

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const {
    title,
    description,
    category,
    quantity,
    estimatedCost,
    currency,
    productLink,
    date
  } = req.body;

  // Required fields validation
  if (!title || estimatedCost == null) {
    throw new ApiError(400, "Title and estimated cost are required");
  }

  // Validate quantity
  const parsedQuantity = Number(quantity || 1);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    throw new ApiError(400, "Invalid quantity");
  }

  // Validate estimated cost
  const parsedCost = Number(estimatedCost);
  if (!Number.isFinite(parsedCost) || parsedCost <= 0) {
    throw new ApiError(400, "Invalid estimated cost");
  }

  const MAX_COST = 10000000;
  if (parsedCost > MAX_COST) {
    throw new ApiError(400, "Estimated cost exceeds allowed limit");
  }

  // Create purchase request
  const createdRequest = await purchaseRequestModel.create({
    title: title.trim(),
    description: description?.trim(),
    category,
    date,
    quantity: parsedQuantity,
    estimatedCost: parsedCost,
    currency: currency || "INR",
    productLink: productLink?.trim(),
    raisedBy: {
      userId: req.user.userId,
      dept: req.user.dept,
      userRef: req.user._id
    },
    organizationId
  });

  return res.status(201).json({
    success: true,
    message: "Purchase request created successfully",
    request: createdRequest
  });

});


//SubMITTING THE PURCHASE REQUEST
export const submitPurchaseRequest = asyncHandler(async (req, res) => {

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const { id } = req.params;

  const request = await purchaseRequestModel.findOne({
    organizationId,
    "raisedBy.userId": req.user.userId,
    _id: id,
  });

  if (!request) {
    throw new ApiError(404, "Purchase request not found");
  }

  // Only draft requests can be submitted
  if (request.status !== "DRAFT") {
    throw new ApiError(400, "Only draft requests can be submitted");
  }

  // Validate required fields before submission
  if (!request.title || !request.estimatedCost) {
    throw new ApiError(
      400,
      "Purchase request is incomplete. Title and estimated cost are required before submission."
    );
  }

  request.status = "SUBMITTED";

  await request.save();

  return res.status(200).json({
    success: true,
    message: "Purchase request submitted successfully",
    request
  });

});


// ALL PURCHASE REQUESTS BY EMPLOYEE
export const getMyPurchaseRequests = asyncHandler(async (req, res) => {

  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const employeeId = req.user.userId;
  if (!employeeId) {
    throw new ApiError(401, "Unauthorized user");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const status = req.query.status;

  const query = {
    organizationId,
    "raisedBy.userId": employeeId,
  };

  // status filter 
  if (status && status !== "ALL") {
    query.status = status;
  }

  const requests = await purchaseRequestModel
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await purchaseRequestModel.countDocuments(query);

  return res.status(200).json({
    success: true,
    page,
    limit,
    totalRequests: total,
    totalPages: Math.ceil(total / limit),
    requests
  });

});



// ALL EMPLOYEES PURCHASE REQUESTS FOR ADMIN
export const getAllPurchaseRequests = asyncHandler(async (req, res) => {

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const { dept, page = 1, limit = 10, status } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const skip = (pageNumber - 1) * limitNumber;

  const query = { organizationId };

  // STATUS FILTER
  if (status && status !== "ALL") {
    query.status = status;   // SUBMITTED / APPROVED / REJECTED
  } else {
    // If ALL selected → exclude drafts
    query.status = { $ne: "DRAFT" };
  }

  // DEPARTMENT FILTER
  if (dept) {
    query["raisedBy.dept"] = dept;
  }

  const requests = await purchaseRequestModel
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  const total = await purchaseRequestModel.countDocuments(query);

  return res.status(200).json({
    success: true,
    totalRequests: total,
    totalPages: Math.ceil(total / limitNumber),
    currentPage: pageNumber,
    requests
  });

});




//Approving the request
export const approvePurchaseRequest = asyncHandler(async (req, res) => {

  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const { id } = req.params;

  const request = await purchaseRequestModel.findOne({
    organizationId,
    _id: id,
  });

  if (!request) {
    throw new ApiError(404, "Purchase request not found");
  }

  if (request.status !== "SUBMITTED") {
    throw new ApiError(400, "Only submitted requests can be approved");
  }

  request.status = "APPROVED";
  request.rejectionReason = undefined;

  await request.save();

  return res.status(200).json({
    success: true,
    message: "Purchase request approved successfully",
    request
  });

});



//REJECTING THE REQUEST
export const rejectPurchaseRequest = asyncHandler(async (req, res) => {

  const organizationId = req.user?.organizationId;
  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason || rejectionReason.trim().length === 0) {
    throw new ApiError(400, "Rejection reason is required");
  }

  const request = await purchaseRequestModel.findOne({
    organizationId,
    _id: id,
  });

  if (!request) {
    throw new ApiError(404, "Purchase request not found");
  }

  if (request.status !== "SUBMITTED") {
    throw new ApiError(400, "Only submitted requests can be rejected");
  }

  request.status = "REJECTED";
  request.rejectionReason = rejectionReason.trim();

  await request.save();

  return res.status(200).json({
    success: true,
    message: "Purchase request rejected",
    request
  });

});



//EDIT THE PURCHASE REq
export const editPurchaseRequest = asyncHandler(async (req, res) => {

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const { id } = req.params;

  const request = await purchaseRequestModel.findOne({
    organizationId,
    "raisedBy.userId": req.user.userId,
    _id: id,
  });

  if (!request) {
    throw new ApiError(404, "Purchase request not found");
  }

  if (request.status !== "DRAFT") {
    throw new ApiError(400, "Only draft requests can be edited");
  }

  const {
    title,
    description,
    category,
    quantity,
    estimatedCost,
    currency,
    productLink,
    date
  } = req.body;

  if (title) request.title = title.trim();
  if (description) request.description = description.trim();
  if (category) request.category = category;
  if (date) request.date = date;

  if (quantity !== undefined) {
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      throw new ApiError(400, "Invalid quantity");
    }
    request.quantity = parsedQuantity;
  }

  if (estimatedCost !== undefined) {
    const parsedCost = Number(estimatedCost);
    if (!Number.isFinite(parsedCost) || parsedCost <= 0) {
      throw new ApiError(400, "Invalid estimated cost");
    }
    request.estimatedCost = parsedCost;
  }

  if (currency) request.currency = currency;
  if (productLink) request.productLink = productLink.trim();

  await request.save();

  return res.status(200).json({
    success: true,
    message: "Purchase request updated successfully",
    request
  });

});



//DELETE PURCHASE REQUEST
export const deletePurchaseRequest = asyncHandler(async (req, res) => {

  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new ApiError(401, "Organization not found in token");
  }

  const { id } = req.params;

  const request = await purchaseRequestModel.findOne({
    organizationId,
    "raisedBy.userId": req.user.userId,
    _id: id,
  });

  if (!request) {
    throw new ApiError(404, "Purchase request not found");
  }

  if (request.status !== "DRAFT") {
    throw new ApiError(400, "Only draft requests can be deleted");
  }

  await purchaseRequestModel.deleteOne({ _id: id });

  return res.status(200).json({
    success: true,
    message: "Purchase request deleted successfully"
  });

});