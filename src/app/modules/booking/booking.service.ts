/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { Booking } from "./booking.model";
import { Tour } from "../tour/tour.model";
import { User } from "../user/user.model";

// Create a booking (tour package or guide hire)
const createBooking = async (req: Request, user: JwtPayload) => {
  if (user.role !== "TOURIST") {
    throw new AppError(403, "Only tourists can create bookings");
  }

  const { bookingType, tourId, guideId, hourlyRate, hours, tourDate } =
    req.body;

  const bookingData: any = {
    bookingType,
    touristId: user.userId,
    tourDate,
    status: "PENDING",
    paymentStatus: "UNPAID",
    statusHistory: [
      {
        status: "PENDING",
        changedBy: user.userId,
        role: "TOURIST",
        changedAt: new Date(),
      },
    ],
  };

  let totalPrice = 0;

  if (bookingType === "GUIDE_HIRE") {
    if (!guideId || !hourlyRate || !hours) {
      throw new AppError(
        400,
        "guideId, hourlyRate, and hours are required for GUIDE_HIRE"
      );
    }

    // ✅ Validate guide exists and is a GUIDE
    const guide = await User.findById(guideId);
    if (!guide || guide.role !== "GUIDE") {
      throw new AppError(404, "Guide not found");
    }
    bookingData.guideId = guideId;
    bookingData.hourlyRate = hourlyRate;
    bookingData.hours = hours;
    totalPrice = hourlyRate * hours;
  } else if (bookingType === "TOUR_PACKAGE") {
    if (!tourId) throw new AppError(400, "tourId is required for TOUR_PACKAGE");
    bookingData.tourId = tourId;

    // Fetch tour price from Tour model
    const tour = await Tour.findById(tourId);
    if (!tour) throw new AppError(404, "Tour not found");
    totalPrice = tour.price;
  }

  bookingData.totalPrice = totalPrice;

  const newBooking = await Booking.create(bookingData);
  return newBooking;
};

// Get single booking by id
const getBookingById = async (req: Request, user: JwtPayload) => {
  const { id } = req.params;
  const booking = await Booking.findById(id)
    .populate("tourId")
    .populate("guideId", "name email")
    .populate("touristId", "name email");

  if (!booking) throw new AppError(404, "Booking not found");

  // Only involved users or admin can access
  if (
    (user.role === "TOURIST" && booking.touristId.toString() !== user.userId) ||
    (user.role === "GUIDE" &&
      booking.bookingType === "GUIDE_HIRE" &&
      booking.guideId?.toString() !== user.userId) ||
    (user.role === "GUIDE" && booking.bookingType === "TOUR_PACKAGE") ||
    (user.role !== "ADMIN" && user.role !== "TOURIST" && user.role !== "GUIDE")
  ) {
    throw new AppError(403, "Unauthorized");
  }

  return booking;
};

// Get all bookings for current user with pagination
const getAllBookings = async (
  req: Request,
  user: JwtPayload,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  let filter: any = {};
  if (user.role === "TOURIST") filter = { touristId: user.userId };
  else if (user.role === "GUIDE") {
    filter = {
      $or: [{ guideId: user.userId }, { "tourId.guideId": user.userId }],
    };
  } else if (user.role === "ADMIN") filter = {};
  else throw new AppError(403, "Unauthorized");

  const bookings = await Booking.find(filter)
    .populate("tourId")
    .populate("guideId", "name email")
    .populate("touristId", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalBookings = await Booking.countDocuments(filter);

  return {
    data: bookings,
    meta: {
      total: totalBookings,
      page,
      limit,
      totalPages: Math.ceil(totalBookings / limit),
    },
  };
};

const updateBookingStatus = async (req: Request, user: JwtPayload) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["CANCELLED", "CONFIRMED", "COMPLETED"].includes(status)) {
    throw new AppError(400, "Invalid status");
  }

  const booking = await Booking.findById(id).populate("tourId");

  if (!booking) throw new AppError(404, "Booking not found");

  const now = new Date();

  if (status === booking.status) {
    return;
  }

  // TOURIST rules
  if (user.role === "TOURIST") {
    if (booking.touristId.toString() !== user.userId)
      throw new AppError(403, "Unauthorized");

    if (status === "CANCELLED") {
      if (booking.status === "CONFIRMED" || booking.status === "COMPLETED") {
        throw new AppError(
          400,
          "Cannot cancel after booking is confirmed or completed"
        );
      }
      booking.status = "CANCELLED";
      booking.statusHistory.push({
        status: "CANCELLED",
        changedBy: user.userId,
        role: user.role,
      });
    } else if (status === "CONFIRMED") {
      throw new AppError(403, "Tourist cannot confirm booking");
    } else if (status === "COMPLETED") {
      throw new AppError(403, "Tourist cannot mark booking complete");
    }
  }

  // GUIDE rules
  if (user.role === "GUIDE") {
    // GUIDE_HIRE
    if (
      booking.bookingType === "GUIDE_HIRE" &&
      booking.guideId?.toString() !== user.userId
    )
      throw new AppError(403, "Unauthorized");

    // TOUR_PACKAGE: guide comes from tour
    // if (
    //   booking.bookingType === "TOUR_PACKAGE" &&
    //   booking.tourId?.guideId.toString() !== user.userId
    // )
    //   throw new AppError(403, "Unauthorized");

    if (status === "CANCELLED") {
      if (booking.status === "CONFIRMED" || booking.status === "COMPLETED") {
        throw new AppError(
          400,
          "Guide cannot cancel after confirmation or complete"
        );
      }
      booking.status = "CANCELLED";
      booking.statusHistory.push({
        status: "CANCELLED",
        changedBy: user.userId,
        role: user.role,
      });
    } else if (status === "COMPLETED") {
      if (booking.status !== "CONFIRMED") {
        throw new AppError(400, "Cannot complete booking before confirmed");
      }
      if (booking.tourDate > now) {
        throw new AppError(400, "Cannot complete booking before tour date");
      }
      booking.status = "COMPLETED";
      // booking.completedAt = now;
      booking.statusHistory.push({
        status: "COMPLETED",
        changedBy: user.userId,
        role: "GUIDE",
        changedAt: now,
      });
    } else if (status === "CONFIRMED") {
      booking.status = "CONFIRMED";
      booking.statusHistory.push({
        status: "CONFIRMED",
        changedBy: user.userId,
        role: user.role,
      });
    }
  }

  await booking.save();
  return booking;
};

export const BookingServices = {
  createBooking,
  updateBookingStatus,
  getBookingById,
  getAllBookings,
};
