import httpStatus from "http-status-codes";
import { ReviewService } from "./review.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createReview = catchAsync(async (req, res) => {
  const result = await ReviewService.createReview(req.user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review created successfully",
    data: result,
  });
});

const getGuideReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getGuideReviews(req.params.guideId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guide reviews retrieved successfully",
    data: result,
  });
});

const getTourReviews = catchAsync(async (req, res) => {
  const result = await ReviewService.getTourReviews(req.params.tourId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Tour reviews retrieved successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const result = await ReviewService.updateReview(
    req.user,
    req.params.reviewId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const result = await ReviewService.deleteReview(
    req.user,
    req.params.reviewId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  deleteReview,
  updateReview,
  getTourReviews,
  getGuideReviews,
};
