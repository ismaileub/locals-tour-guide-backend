import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { ReviewController } from "./review.controller";
import { Role } from "../user/user.interface";

const router = express.Router();

// Tourist creates review
router.post("/", checkAuth(Role.TOURIST), ReviewController.createReview);

// Public review listing
router.get("/guide/:guideId", ReviewController.getGuideReviews);
router.get("/tour/:tourId", ReviewController.getTourReviews);

// Tourist update own review
router.patch("/:id", checkAuth(Role.TOURIST), ReviewController.updateReview);

// Tourist or Admin delete review
router.delete(
  "/:reviewId",
  checkAuth(Role.TOURIST, Role.ADMIN),
  ReviewController.deleteReview
);

export const ReviewRoutes = router;
