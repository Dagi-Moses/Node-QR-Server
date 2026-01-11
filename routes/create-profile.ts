import express from "express";
import clerkClient, { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.options("/", (_req, res) => {
  console.log("Options");
  res.sendStatus(204);
});

router.post(
  "/",
  ClerkExpressRequireAuth() as any,
  async (req: any, res: any) => {
    try {
      const clerkUserId = req.auth?.userId;

      const user = await clerkClient.users.getUser(clerkUserId);
      const email = user.emailAddresses[0]?.emailAddress;

      if (!clerkUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!email) {
        return res.status(400).json({ error: "Email not found" });
      }

      const existingProfile = await prisma.profile.findUnique({
        where: { userId: clerkUserId },
      });

      if (existingProfile) {
        return res.json({ message: "Profile already exists" });
      }

      await prisma.profile.create({
        data: {
          userId: clerkUserId,
          email,
        },
      });

      console.log("STEP 10 ✅ Profile successfully created");

      return res.status(201).json({ message: "Profile created" });
    } catch (err) {
      console.error("STEP 11 ❌ Error caught:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
