import { Router } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import prisma from "../lib/prisma.js";
import { QRStatus } from "@prisma/client";

const router = Router();

//Fetch all user's QR codes in a particular project via [:projectId]
router.get(
  "/projects/:projectId/qrs",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.auth.userId;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const search =
        typeof req.query.search === "string" &&
        req.query.search.trim().length > 0
          ? req.query.search.trim()
          : undefined;

      // const status = req.query.status?.toString() || "";
      const status = Object.values(QRStatus).includes(req.query.status)
        ? req.query.status
        : undefined;

      const where: any = {
        projectId,
        project: {
          userId,
        },
      };

      if (status && status !== "all") where.status = status;
      if (search) {
        where.name = { contains: search };
      }
      console.log("DEBUG /qrs");
      console.log("projectId:", projectId);
      console.log("userId:", userId);
      console.log("page:", page, "limit:", limit, "skip:", skip);
      console.log("raw status:", req.query.status);
      console.log("parsed status:", status);
      console.log("search:", search);
      console.log("where clause:", JSON.stringify(where, null, 2));
      const [qrs, total] = await Promise.all([
        prisma.qRCode.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
            payload: true,
            type: true,
            projectId: true,
          },
        }),
        prisma.qRCode.count({ where }),
      ]);

      res.json({
        data: qrs,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      console.error("Fetch QRs error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Get QR details (owner only)
router.get(
  "/projects/:projectId/qrs/:qrId",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    const { projectId, qrId } = req.params;
    const userId = req.auth.userId;

    try {
      const qr = await prisma.qRCode.findFirst({
        where: {
          id: qrId,
          projectId,
          project: { userId },
        },
      });

      if (!qr) return res.status(404).json({ message: "QR not found" });

      res.json(qr);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to Fetch QR", error });
    }
  },
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
  },
);

router.post(
  "/projects/:projectId",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.auth.userId;

      const { name, payload } = req.body;

      console.log("create qr code called:", req.body);

      // ---- basic validation ----
      if (!name && !payload) {
        return res.status(400).json({
          error: "name and payload are required",
        });
      }

      // ---- ensure project belongs to user ----
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId,
        },
        select: { id: true },
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // ---- create QR ----
      const qr = await prisma.qRCode.create({
        data: {
          projectId,
          name: name?.trim() || null,
          payload, // stored as Json
        },
      });

      res.status(201).json(qr);
    } catch (err) {
      console.error("Create QR error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
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
  },
);

export default router;
