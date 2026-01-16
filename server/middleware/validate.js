import { AppError } from "../utils/appError.js";

// Validate registration input
export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return next(
      new AppError("Please provide name, email, password and role", 400)
    );
  }

  if (password.length < 6) {
    return next(
      new AppError("Password must be at least 6 characters long", 400)
    );
  }

  next();
};

// Validate login input
export const validateLogin = (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return next(
      new AppError("Please provide email, password and role", 400)
    );
  }

  next();
};