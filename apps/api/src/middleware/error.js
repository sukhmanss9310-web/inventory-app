export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const isValidationError = error.name === "ZodError";
  const isMongooseValidationError = error.name === "ValidationError";
  const isDuplicateKeyError = error.code === 11000;

  if (isValidationError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (isMongooseValidationError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: Object.values(error.errors).map((issue) => ({
        field: issue.path,
        message: issue.message
      }))
    });
  }

  if (isDuplicateKeyError) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";

    return res.status(409).json({
      message: `${field} must be unique`
    });
  }

  return res.status(statusCode).json({
    message: error.message || "Something went wrong",
    ...(process.env.NODE_ENV !== "production" && error.stack
      ? { stack: error.stack }
      : {})
  });
};
