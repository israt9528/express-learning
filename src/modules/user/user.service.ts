import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IUser } from "./user.interface";

const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password, age, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name,email,password,age,role) VALUES($1,$2,$3,$4,COALESCE($5,'user'))
    RETURNING *
    `,
    [name, email, hashPassword, age, role],
  );
  delete result.rows[0].password;
  return result;
};

const getAllUserFromDB = async () => {
  const result = await pool.query(`
           SELECT *FROM users 
            `);
  delete result.rows[0].password;
  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await pool.query(
    `
            SELECT *FROM users WHERE id=$1
            `,
    [id],
  );
  delete result.rows[0].password;
  return result;
};

const updateUserFromDB = async (payload: IUser, id: string) => {
  const { name, password, age, role, is_active } = payload;
  const result = await pool.query(
    `
           UPDATE users SET 
           name=COALESCE($1,name),
           password=COALESCE($2,password),
           age=COALESCE($3,age),
           role=COALESCE($4,role),
           is_active=COALESCE($5,is_active)
           WHERE id=$6 RETURNING * 
            `,
    [name, password, age, role, is_active, id],
  );
  return result;
};

const deleteUserFromDB = async (id: string) => {
  const result = await pool.query(
    `
          DELETE FROM users WHERE id=$1
            `,
    [id],
  );
  return result;
};

export const userService = {
  createUserIntoDB,
  getAllUserFromDB,
  getSingleUserFromDB,
  updateUserFromDB,
  deleteUserFromDB,
};
