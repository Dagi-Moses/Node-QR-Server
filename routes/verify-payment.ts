import axios from "axios";
import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) {
      return res.status(400).json({ error: "Missing reference" });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res.status(400).json({ success: false });
    }

    // 🔑 Extract metadata you sent during init
    const { userId, planType } = data.metadata;
    const providerSubscriptionId = data.id || null;
    const providerCustomerId = data.customer?.id || null;
    const providerAuthCode = data.authorization?.authorization_code || null;

    if (!userId || !planType) {
      return res.status(400).json({ error: "Missing metadata" });
    }

    // 🧠 Decide subscription duration
    const now = new Date();
    let expiresAt = new Date(now);

    switch (planType) {
      case "week":
        expiresAt.setDate(now.getDate() + 7);
        break;
      case "month":
        expiresAt.setMonth(now.getMonth() + 1);
        break;
      case "year":
        expiresAt.setFullYear(now.getFullYear() + 1);
        break;
    }

    // ✅ Update DB

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        active: true,
        planType,
        expiresAt,
        reference,
        providerSubscriptionId,
        providerCustomerId,
        providerAuthCode,
      },
      create: {
        userId,
        planType,
        active: true,
        expiresAt,
        reference,
        provider: "paystack",
        providerSubscriptionId,
        providerCustomerId,
        providerAuthCode,
        profile: {
          connect: {
            userId: userId,
          },
        },
      },
    });

    return res.json({ success: true });
  } catch (err: any) {
    console.error("Verify payment error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
