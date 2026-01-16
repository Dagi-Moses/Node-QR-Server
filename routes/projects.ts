// routes/projects.ts
import express from "express";
import prisma from "../lib/prisma";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const router = express.Router();

router.get(
  "/api/projects",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    try {
      const userId = req.auth.userId;

      const projects = await prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          createdAt: true,

          _count: {
            select: {
              qrs: true,
            },
          },

          qrs: {
            select: {
              qrScans: {
                select: { createdAt: true },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      const response = projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        createdAt: p.createdAt,

        qrCount: p._count.qrs,
      }));

      res.json(response);
    } catch (err) {
      console.error("Fetch projects error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/api/projects/:projectId",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    const { projectId } = req.params;
    const userId = req.auth.userId;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      select: {
        id: true,
        name: true,
        status: true,
        description: true,
      },
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  }
);

//EDIT A PARTICULAR PROJECT DETAILS IN EDIT PAGE
router.put(
  "/api/projects/:projectId",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.auth.userId;
      const { name, description, status } = req.body;

      if (!name || !["active", "draft", "archived"].includes(status)) {
        return res.status(400).json({ message: "Invalid payload" });
      }

      const result = await prisma.project.updateMany({
        where: {
          id: projectId,
          userId,
        },
        data: {
          name,
          description,
          status,
        },
      });

      if (result.count === 0) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Update project error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

//CREATE A PROJECT
router.post(
  "/api/projects",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    const userId = req.auth.userId;
    const { name, description } = req.body;

    if (!name?.trim())
      return res.status(400).json({ message: "Project name is required" });

    try {
      const project = await prisma.project.create({
        data: {
          name: name.trim(),
          description: description?.trim() || "",
          userId,
        },
      });

      res.json(project);
    } catch (err) {
      console.error("Create project error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.delete(
  "/api/projects/:projectId",
  ClerkExpressRequireAuth() as any,
  async (req: any, res) => {
    const { projectId } = req.params;
    const userId = req.auth.userId;

    try {
      const deleted = await prisma.project.deleteMany({
        where: {
          id: projectId,
          userId,
        },
      });

      if (deleted.count === 0) {
        return res
          .status(404)
          .json({ message: "Project not found or not yours" });
      }

      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  }
);

export default router;
