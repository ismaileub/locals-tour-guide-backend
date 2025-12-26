import { Schema, model } from "mongoose";
import { IReview } from "./review.interface";

const reviewSchema = new Schema<IReview>(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },

    targetType: {
      type: String,
      enum: ["GUIDE", "TOUR"],
      required: true,
    },

    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Review = model<IReview>("Review", reviewSchema);
