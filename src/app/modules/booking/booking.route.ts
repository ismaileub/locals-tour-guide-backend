import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { BookingControllers } from "./booking.controller";
import { Role } from "../user/user.interface";

const router = Router();

// Tourist creates a booking
router.post("/", checkAuth(Role.TOURIST), BookingControllers.createBooking);
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.GUIDE, Role.TOURIST),
  BookingControllers.getAllBookings
);
router.get(
  "/pending",
  checkAuth(Role.GUIDE),
  BookingControllers.getPendingBookingsForGuide
);

router.get(
  "/single-booking/:id",
  checkAuth(Role.TOURIST),
  BookingControllers.getSingleBookingByTouristIdAndTargetId
);
router.get(
  "/confirmed-complete",
  checkAuth(Role.GUIDE),
  BookingControllers.getConfirmedAndCompleteBookingsForGuide
);

router.get(
  "/need-payment",
  checkAuth(Role.TOURIST),
  BookingControllers.getBookingsNeedPayment
);
router.get(
  "/paid-booking",
  checkAuth(Role.TOURIST, Role.GUIDE),
  BookingControllers.getPaidBookings
);

router.get(
  "/unpaid-booking",
  checkAuth(Role.GUIDE, Role.TOURIST),
  BookingControllers.getAllUnpaidBookingsOfGuide
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.GUIDE, Role.TOURIST),
  BookingControllers.getBooking
);

router.patch(
  "/:id",
  checkAuth(Role.GUIDE, Role.TOURIST),
  BookingControllers.updateBooking
);

export const BookingRoutes = router;
