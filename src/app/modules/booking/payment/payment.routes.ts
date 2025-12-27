import express from "express";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.post("/create-payment-intent", PaymentController.createPaymentIntent);
router.post("/save-payment", PaymentController.savePayment);
router.get("/:bookingId", PaymentController.getPaymentByBookingId);

export const PaymentRoutes = router;
