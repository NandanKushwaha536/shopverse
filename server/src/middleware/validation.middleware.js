import ApiError from "../utils/ApiError.js";

export const validate = (validator) => {
  return (req, res, next) => {
    const errors = validator(req.body);

    if (errors.length > 0) {
      return next(
        new ApiError(400, errors.join(", "))
      );
    }

    next();
  };
};