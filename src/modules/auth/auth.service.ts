import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
       SELECT * FROM users WHERE email=$1        
        `,
    [email],
  );
  //   console.log(userData);
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }

  const user = userData.rows[0];

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
  };

  const accessToken = jwt.sign(jwtPayload, config.secret, { expiresIn: 6000 });
  const refreshToken = jwt.sign(jwtPayload, config.refresh_secret, {
    expiresIn: 6000,
  });

  return { accessToken, refreshToken };
};
const generateRefreshToken = async (token: string) => {
  if (!token) {
    throw new Error("Unauthorized!");
  }

  const decoded = jwt.verify(
    token as string,
    config.refresh_secret,
  ) as JwtPayload;

  const userdata = await pool.query(
    `
     SELECT * FROM users WHERE email=$1 
      `,
    [decoded.email],
  );

  const user = userdata.rows[0];
  if (userdata.rows.length === 0) {
    throw new Error("User not found");
  }
  if (!user?.is_active) {
    throw new Error("Forbidden!");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.is_active,
  };

  const accessToken = jwt.sign(jwtPayload, config.secret, {
    expiresIn: 6000,
  });

  return { accessToken };
};

export const authService = {
  loginUserIntoDB,
  generateRefreshToken,
};
