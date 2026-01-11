import express from "express";
import prisma from "../lib/prisma.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();

router.get(
  "/",
  ClerkExpressRequireAuth() as any,

  async (req: any, res: any) => {
    console.log("fetching subscription");
    try {
      // however you attach auth (Clerk, JWT, session)
      const userId = req.auth?.userId || req.user?.id;
      console.log("User ID ", userId);
      if (!userId) {
        console.error("Unauthorized");
        return res.status(401).json({ error: "Unauthorized" });
      }

      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (!subscription) {
        return res.json({
          isSubscribed: false,
          plan: "free",
        });
      }
      console.error("Subscription ", subscription);
      const now = new Date();
      const isSubscribed = subscription.active && subscription.expiresAt > now;

      return res.json({
        isSubscribed,
        plan: isSubscribed ? subscription.planType : "free",
        expiresAt: subscription.expiresAt,
      });
    } catch (err) {
      console.error("Fetch subscription error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
