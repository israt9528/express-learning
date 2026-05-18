import type { startupSnapshot } from "node:v8";

export interface IUser {
  name: string;
  email: string;
  password: string;
  age: number;
  role?: "admin" | "agent" | "user";
  is_active?: boolean;
}
