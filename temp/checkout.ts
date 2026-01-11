import express from "express";
import { stripe } from "../lib/stripe";
import { getPriceIdFromType } from "../lib/plans";

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

    const priceId = getPriceIdFromType(planType);
    if (!priceId) {
      return res
        .status(400)
        .json({ error: "Price ID for the selected plan not found." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      mode: "subscription",
      metadata: { clerkUserId: userId, planType },
      success_url: `${process.env.FRONTEND_BASE_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_BASE_URL}/subscribe`,
    });

    return res.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout API Error:", error.message);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
});

export default router;
