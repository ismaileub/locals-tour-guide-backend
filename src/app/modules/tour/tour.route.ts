/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";

import { fileUploader } from "../../helpers/fileUploader";
import { TourControllers } from "./tour.controller";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.GUIDE),
  fileUploader.upload.single("file"), // handle optional file
  TourControllers.createTour // controller handles JSON parsing and file
);

router.get("/", TourControllers.getAllTours);
router.get("/my-tours", checkAuth(Role.GUIDE), TourControllers.getMyTours);

router.get("/:id", TourControllers.getTourById);

router.patch("/:id", checkAuth(Role.GUIDE), TourControllers.updateTour);

router.delete("/:id", checkAuth(Role.GUIDE), TourControllers.deleteTour);

export const TourRoutes = router;
