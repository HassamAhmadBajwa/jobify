import {
  UnauthenticatedError,
  UnauthorizedError,
  BadRequestError,
} from "../error/customError.js";
import { verifyJwt } from "../utils/tokenUtils.js";

export const authenticateUser = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new UnauthenticatedError("authentication invalid ");
  }
  try {
    const { userId, role } = verifyJwt(token);
    const testUser = userId === "670ed158efdbcfaa9124452e";
    req.user = { userId, role, testUser };
    next();
  } catch (error) {
    throw new UnauthenticatedError("authentication invalid");
  }
};

export const authorizedPermission = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      throw new UnauthorizedError("unauthorized to access this route");
    }
    next();
  };
};

export const checkForTestUser = (req, res, next) => {
  if (req.user.testUser) {
    throw new BadRequestError("Demo User. Read Only");
  }

  next();
};
