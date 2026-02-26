
const errorMiddleware = (err, req, res, next) => {
  console.error(" ERROR:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongo duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value entered";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorMiddleware;