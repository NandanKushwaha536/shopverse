import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

export const registerService = async (
  name,
  email,
  password
) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = user.generateToken();

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const loginService = async (
  email,
  password
) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(
      400,
      "Invalid email or password"
    );
  }

  const isPasswordMatch =
    await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new ApiError(
      400,
      "Invalid email or password"
    );
  }

  const token = user.generateToken();

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getProfileService = async (user) => {
  return user;
};