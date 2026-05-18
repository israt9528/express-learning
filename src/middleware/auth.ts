import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { role } from "../types";

const auth = (...roles: role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(roles);

    try {
      // console.log("this is protected route");
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access!",
        });
      }

      const decoded = jwt.verify(token as string, config.secret) as JwtPayload;

      const userdata = await pool.query(
        `
     SELECT * FROM users WHERE email=$1 
      `,
        [decoded.email],
      );

      const user = userdata.rows[0];
      if (userdata.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User not found!",
        });
      }
      if (!user?.is_active) {
        res.status(403).json({
          success: false,
          message: "Forbidden!",
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden! This role has no access",
        });
      }

      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};
export default auth;
