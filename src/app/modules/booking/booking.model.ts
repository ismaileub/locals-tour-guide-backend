import { Schema, model, Types } from "mongoose";
import { IBooking } from "./booking.interfaces";

// Status log type
export interface IBookingStatusLog {
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  changedBy: Types.ObjectId;
  role: "GUIDE" | "TOURIST" | "SYSTEM";
  changedAt?: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingType: {
      type: String,
      enum: ["GUIDE_HIRE", "TOUR_PACKAGE"],
      required: true,
    },

    tourId: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: function () {
        return this.bookingType === "TOUR_PACKAGE";
      },
    },

    guideId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.bookingType === "GUIDE_HIRE";
      },
    },

    hourlyRate: {
      type: Number,
      required: function () {
        return this.bookingType === "GUIDE_HIRE";
      },
    },

    hours: {
      type: Number,
      required: function () {
        return this.bookingType === "GUIDE_HIRE";
      },
    },

    touristId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tourDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID",
    },

    paymentId: { type: String },

    //completedAt: { type: Date },

    statusHistory: [
      {
        status: {
          type: String,
          enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
          required: true,
        },
        changedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["GUIDE", "TOURIST"],
          required: true,
        },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const Booking = model<IBooking>("Booking", bookingSchema);
