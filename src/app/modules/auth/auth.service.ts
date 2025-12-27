/* eslint-disable @typescript-eslint/no-non-null-assertion */
import bcrypt from "bcrypt";
import AppError from "../../errorHelpers/AppError";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";

const credentialsLogin = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password as string
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
  }

  const tokens = await createUserTokens(user);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, ...userWithoutPassword } = user.toObject();

  return {
    user: userWithoutPassword,
    tokens,
  };
};
const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );

  return {
    accessToken: newAccessToken,
  };
};

export const AuthServices = {
  getNewAccessToken,
  credentialsLogin,
};
