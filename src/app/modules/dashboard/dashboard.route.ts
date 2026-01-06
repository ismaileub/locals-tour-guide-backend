import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { DashboardController } from "./dashboard.controller";
import express from "express";

const router = express.Router();

router.get(
  "/summary",
  checkAuth(Role.GUIDE, Role.ADMIN, Role.TOURIST),
  DashboardController.getDashboardSummary
);

export const DashboardRoutes = router;
