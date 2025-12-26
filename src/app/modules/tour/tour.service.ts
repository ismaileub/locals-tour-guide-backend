/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { ITourInput } from "./tour.interface";
import { Tour } from "./tour.model";
import { fileUploader } from "../../helpers/fileUploader";
import mongoose from "mongoose";

const createTour = async (req: Request, user: JwtPayload) => {
  if (user.role !== "GUIDE") {
    throw new AppError(403, "Only guides can create tours");
  }

  // Extract fields from req.body
  const payload = { ...req.body };

  // Upload image if exists
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    payload.coverPhoto = uploadResult?.secure_url;
  }

  // Add guide automatically
  const newTour = await Tour.create({
    ...payload,
    guide: user.userId,
  });

  return newTour;
};

const updateTour = async (req: Request, user: JwtPayload) => {
  if (user.role !== "GUIDE") {
    throw new AppError(403, "Only guides can update tours");
  }

  const { id } = req.params;

  // Check ownership
  const tour = await Tour.findOne({ _id: id, guide: user.userId });

  if (!tour) {
    throw new AppError(404, "Tour not found or unauthorized");
  }

  // Create payload from JSON only
  const payload: Partial<ITourInput> = {
    title: req.body.title,
    location: req.body.location,
    price: req.body.price ? Number(req.body.price) : undefined,
    duration: req.body.duration,
    description: req.body.description,
    spots: req.body.spots ? req.body.spots : undefined,
  };

  delete payload.coverPhoto;

  const updatedTour = await Tour.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedTour;
};

const deleteTour = async (req: Request, user: JwtPayload) => {
  if (user.role !== "GUIDE") {
    throw new AppError(403, "Only guides can delete tours");
  }

  const { id } = req.params;

  const tour = await Tour.findOne({ _id: id, guide: user.userId });

  if (!tour) {
    throw new AppError(404, "Tour not found or unauthorized");
  }

  await Tour.findByIdAndDelete(id);

  return true;
};

const getTourById = async (id: string) => {
  const tour = await Tour.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },

    // Join guide info
    {
      $lookup: {
        from: "users",
        localField: "guide",
        foreignField: "_id",
        as: "guide",
      },
    },
    { $unwind: "$guide" },

    // Join tour reviews
    {
      $lookup: {
        from: "reviews",
        let: { tourId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$targetId", "$$tourId"] },
                  { $eq: ["$targetType", "TOUR"] },
                ],
              },
            },
          },

          // Join reviewer info
          {
            $lookup: {
              from: "users",
              localField: "reviewerId",
              foreignField: "_id",
              as: "reviewer",
            },
          },
          { $unwind: "$reviewer" },

          {
            $project: {
              _id: 1,
              rating: 1,
              comment: 1,
              createdAt: 1,
              reviewer: {
                _id: "$reviewer._id",
                name: "$reviewer.name",
                picture: "$reviewer.picture",
              },
            },
          },
        ],
        as: "reviews",
      },
    },

    // Calculate avg rating
    {
      $addFields: {
        avgRating: {
          $ifNull: [{ $avg: "$reviews.rating" }, 0],
        },
        totalReviews: { $size: "$reviews" },
      },
    },

    // Clean guide data
    {
      $project: {
        "guide.password": 0,
        "guide.role": 0,
      },
    },
  ]);

  if (!tour.length) {
    throw new AppError(404, "Tour not found");
  }

  return tour[0];
};

const getAllTours = async (req: Request) => {
  const {
    tourType,
    page = "1",
    limit = "6",
    sortBy = "price",
    sortOrder = "asc",
  } = req.query;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const filter: any = {};
  if (tourType) filter.tourType = tourType;

  // Determine sort order: 1 = ascending, -1 = descending
  const sort: any = {};
  sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

  const total = await Tour.countDocuments(filter);

  const tours = await Tour.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber);

  return {
    data: tours,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

const getMyTours = async (user: JwtPayload) => {
  if (user.role !== "GUIDE") {
    throw new AppError(403, "Only guides can view their tours");
  }

  const tours = await Tour.find({ guide: user.userId });

  return tours;
};

export const TourServices = {
  createTour,
  deleteTour,
  updateTour,
  getTourById,
  getAllTours,
  getMyTours,
};
