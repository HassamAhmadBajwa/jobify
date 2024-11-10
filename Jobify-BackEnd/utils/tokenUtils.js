import jwt from "jsonwebtoken";

export const createJwt = (payload) => {
  const token = jwt.sign(payload, process.env.SECRETE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

export const verifyJwt = (token) => {
  const decode = jwt.verify(token, process.env.SECRETE);
  return decode;
};
