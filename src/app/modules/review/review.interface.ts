import { Types } from "mongoose";

export type TTargetType = "GUIDE" | "TOUR";

export interface IReview {
  _id?: Types.ObjectId;

  reviewerId: Types.ObjectId;
  bookingId: Types.ObjectId;

  targetType: TTargetType; // GUIDE or TOUR
  targetId: Types.ObjectId; // GuideId or TourId

  rating: number; // 1–5
  comment?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
