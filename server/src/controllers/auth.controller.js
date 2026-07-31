import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  registerService,
  loginService,
  getProfileService,
} from "../services/auth.service.js";

import { AUTH_MESSAGES } from "../constants/messages.js";
import { sendResponse } from "../utils/sendResponse.js";


export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const data = await registerService(name, email, password);

  return sendResponse(
    res,
    201,
    data,
    AUTH_MESSAGES.REGISTER_SUCCESS
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const data = await loginService(email, password);

  return sendResponse(
    res,
    200,
    data,
    AUTH_MESSAGES.LOGIN_SUCCESS
  );
});


export const getProfile = asyncHandler(async (req, res) => {
  const user = await getProfileService(req.user);

  return sendResponse(
    res,
    200,
    user,
    AUTH_MESSAGES.PROFILE_FETCHED
  );
});

