import { Router } from "express";
import prisma from "../lib/prisma.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
const router = Router();

router.get(
  "/api/profile",
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
  },
);

router.get(
  "/api/user-mini",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Fetch only the fields needed for UserMini
      const profile = await prisma.profile.findUnique({
        where: { userId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json({
        id: profile.id,
        name: profile.name,
        email: profile.email,
      });
    } catch (err) {
      console.error("Fetch user-mini error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
