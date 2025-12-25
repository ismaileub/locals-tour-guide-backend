import { Types } from "mongoose";
import { IBookingStatusLog } from "./booking.model";

export interface IBooking {
  _id?: Types.ObjectId;

  bookingType: "GUIDE_HIRE" | "TOUR_PACKAGE";

  // Only for TOUR_PACKAGE
  tourId?: Types.ObjectId;

  // Only for GUIDE_HIRE
  guideId?: Types.ObjectId;
  hourlyRate?: number;
  hours?: number;

  touristId: Types.ObjectId;
  tourDate: Date;

  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentStatus: "UNPAID" | "PAID";
  paymentId?: string;
  totalPrice: number;

  createdAt: Date;
  //completedAt?: Date;

  statusHistory: IBookingStatusLog[];
}
