/* eslint-disable @typescript-eslint/no-explicit-any */
import { Review } from "./review.model";
import { Booking } from "../booking/booking.model";
import AppError from "../../errorHelpers/AppError";

const createReview = async (user: any, payload: any) => {
  if (user.role !== "TOURIST") {
    throw new AppError(403, "Only tourists can review");
  }

  const { bookingId, rating, comment } = payload;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError(404, "Booking not found");

  if (booking.touristId.toString() !== user.userId) {
    throw new AppError(403, "This booking is not yours");
  }

  if (booking.status !== "COMPLETED") {
    throw new AppError(400, "Booking not completed yet");
  }

  const exists = await Review.findOne({ bookingId });
  if (exists) throw new AppError(400, "You already reviewed this booking");

  let targetType: "GUIDE" | "TOUR";
  let targetId;

  if (booking.bookingType === "GUIDE_HIRE") {
    targetType = "GUIDE";
    targetId = booking.guideId;
  } else {
    targetType = "TOUR";
    targetId = booking.tourId;
  }

  const review = await Review.create({
    reviewerId: user.userId,
    bookingId,
    targetType,
    targetId,
    rating,
    comment,
  });

  return review;
};

const getGuideReviews = async (guideId: string) => {
  return Review.find({ targetType: "GUIDE", targetId: guideId })
    .populate("reviewerId", "name picture ")
    .sort({ createdAt: -1 });
};

const getTourReviews = async (tourId: string) => {
  return Review.find({ targetType: "TOUR", targetId: tourId })
    .populate("reviewerId", "name photo")
    .sort({ createdAt: -1 });
};

const updateReview = async (user: any, reviewId: string, payload: any) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError(404, "Review not found");

  if (review.reviewerId.toString() !== user.userId) {
    throw new AppError(403, "Not your review");
  }

  review.rating = payload.rating ?? review.rating;
  review.comment = payload.comment ?? review.comment;

  await review.save();
  return review;
};

const deleteReview = async (user: any, reviewId: string) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError(404, "Review not found");

  if (review.reviewerId.toString() !== user.userId && user.role !== "ADMIN") {
    throw new AppError(403, "Not allowed");
  }

  await review.deleteOne();
  return { success: true };
};

export const ReviewService = {
  createReview,
  getTourReviews,
  getGuideReviews,
  updateReview,
  deleteReview,
};
