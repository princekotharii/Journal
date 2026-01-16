import User from "../models/User.js";
import crypto from "crypto";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

// @desc    Register user (student or tutor)
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Validate role
  if (!["student", "tutor"].includes(role)) {
    return next(new AppError("Role must be either student or tutor", 400));
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Validate input
  if (!email || !password || !role) {
    return next(new AppError("Please provide email, password and role", 400));
  }

  // Find user and include password
  const user = await User.findOne({ email, role, isActive: true }).select(
    "+password"
  );

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logout = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide email address", 400));
  }

  const user = await User.findOne({ email, isActive: true });

  if (!user) {
    return next(new AppError("No user found with that email", 404));
  }

  // Generate reset token
  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // TODO: Send email with resetURL
  console.log("Password Reset URL:", resetURL);

  res.status(200).json({
    success: true,
    message: "Password reset link sent to email",
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError("Please provide new password", 400));
  }

  // Hash the token from params
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
    isActive: true,
  });

  if (!user) {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Password reset successful",
    token,
  });
});