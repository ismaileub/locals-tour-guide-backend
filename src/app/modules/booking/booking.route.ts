import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { BookingControllers } from "./booking.controller";
import { Role } from "../user/user.interface";

const router = Router();

// Tourist creates a booking
router.post("/", checkAuth(Role.TOURIST), BookingControllers.createBooking);

router.patch(
  "/:id",
  checkAuth(Role.GUIDE, Role.TOURIST),
  BookingControllers.updateBooking
);

// // Get single booking (tourist, guide, admin)
router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.GUIDE, Role.TOURIST),
  BookingControllers.getBooking
);

// // Get all bookings (paginated)
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.GUIDE, Role.TOURIST),
  BookingControllers.getAllBookings
);

export const BookingRoutes = router;
