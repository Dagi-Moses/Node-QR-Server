import express from "express";
import axios from "axios";
import { getPriceFromPlanType } from "../lib/plans.ts";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { planType, userId, email } = req.body;

    if (!planType || !userId || !email) {
      return res.status(400).json({
        error: "Plan type, User ID, and Email are required.",
      });
    }

    const allowedPlanTypes = ["week", "month", "year"];
    if (!allowedPlanTypes.includes(planType)) {
      return res.status(400).json({ error: "Invalid plan type." });
    }

    // Paystack works with AMOUNTS, not price IDs
    const amount = getPriceFromPlanType(planType); // amount in NAIRA
    if (!amount) {
      return res.status(400).json({
        error: "Amount for selected plan not found.",
      });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        metadata: {
          userId,
          planType,
        },
        callback_url: `${process.env.FRONTEND_BASE_URL}/payment-success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      url: response.data.data.authorization_url,
    });
  } catch (error: any) {
    console.error(
      "Paystack Checkout Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      error: "Unable to initialize payment",
    });
  }
});

export default router;
