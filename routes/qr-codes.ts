import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import prisma from "../lib/prisma.js";

const router = Router();

//Fetch all user's QR codes in a particular project via [:projectId]
router.get(
  "/projects/:projectId/qrs",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    const { projectId } = req.params;
    const userId = req.auth.userId;

    const qrs = await prisma.qRCode.findMany({
      where: {
        projectId,
        project: {
          userId,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const response = qrs;

    res.json(response);
  }
);

// Get QR details (owner only)
router.get(
  "/projects/:projectId/qrs/:qrId",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    const { projectId, qrId } = req.params;
    const userId = req.auth.userId;

    const qr = await prisma.qRCode.findFirst({
      where: {
        id: qrId,
        projectId,
        project: { userId },
      },
    });

    if (!qr) return res.status(404).json({ message: "QR not found" });

    res.json(qr);
  }
);

// Update QR (owner only)
router.put(
  "/projects/:projectId/qrs/:qrId",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    const { projectId, qrId } = req.params;
    const userId = req.auth.userId;
    const { name, payload, status } = req.body;

    try {
      const qr = await prisma.qRCode.updateMany({
        where: {
          id: qrId,
          projectId,
          project: { userId },
        },
        data: { name, payload, status },
      });

      if (qr.count === 0)
        return res.status(404).json({ message: "QR not found or not yours" });

      res.json({ message: "QR updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update QR" });
    }
  }
);

// Delete QR (owner only)
router.delete(
  "/projects/:projectId/qrs/:qrId",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    const { projectId, qrId } = req.params;
    const userId = req.auth.userId;

    try {
      const qr = await prisma.qRCode.deleteMany({
        where: {
          id: qrId,
          projectId,
          project: { userId },
        },
      });

      if (qr.count === 0)
        return res.status(404).json({ message: "QR not found or not yours" });

      res.json({ message: "QR deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete QR" });
    }
  }
);

export default router;
