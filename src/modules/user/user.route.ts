import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { user_role } from "../../types";

const router = Router();

router.post("/", userController.createUser);
router.get(
  "/",
  auth(user_role.admin, user_role.agent),
  userController.getAllUser,
);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

export const userRoute = router;
