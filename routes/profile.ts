import { Router } from "express";
import prisma from "../lib/prisma.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
const router = Router();

router.get(
  "/",
  ClerkExpressRequireAuth() as any,
  async (req: any, res: any) => {
    try {
      const userId = req.auth?.userId || req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const profile = await prisma.profile.findUnique({
        where: { userId },
        include: {
          subscription: true,
        },
      });

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.json(profile);
    } catch (error) {
      console.error("Fetch profile error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
