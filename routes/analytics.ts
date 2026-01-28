import express from "express";
import prisma from "../lib/prisma.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

import {
  resolveDateRange,
  resolvePreviousRange,
  percentChange,
} from "../lib/percent-change.js";

const router = express.Router();

router.get(
  "/api/analytics",
  ClerkExpressRequireAuth() as any,
  async (req: any, res: any) => {
    try {
      const userId = req.auth.userId;
      const { range = "all", from, to } = req.query;

      const dateFilter = resolveDateRange(range, from, to);
      const prevDateFilter = resolvePreviousRange(range, from, to);

      const scanWhere: any = {
        ...(dateFilter && { createdAt: dateFilter }),
        qr: { project: { userId } },
      };
      const prevScanWhere: any = {
        ...(prevDateFilter && { createdAt: prevDateFilter }),
        qr: { project: { userId } },
      };

      // ================= STATS =================

      const totalScans = await prisma.qRScan.count({ where: scanWhere });
      const prevTotalScans = await prisma.qRScan.count({
        where: prevScanWhere,
      });

      const uniqueVisitors = await prisma.qRScan
        .findMany({
          where: { ...scanWhere, visitorId: { not: null } },
          distinct: ["visitorId"],
          select: { visitorId: true },
        })
        .then((results) => results.length);

      const prevUniqueVisitors = await prisma.qRScan
        .findMany({
          where: { ...prevScanWhere, visitorId: { not: null } },
          distinct: ["visitorId"],
          select: { visitorId: true },
        })
        .then((results) => results.length);

      const activeQrs = await prisma.qRCode.count({
        where: { status: "active", project: { userId } },
      });
      const prevActiveQrs = await prisma.qRCode.count({
        where: { status: "active", project: { userId } },
      });

      const avgPerCode =
        activeQrs > 0 ? Number((totalScans / activeQrs).toFixed(2)) : 0;
      const prevAvgPerCode =
        prevActiveQrs > 0
          ? Number((prevTotalScans / prevActiveQrs).toFixed(2))
          : 0;

      // Build frontend-ready stats array
      const stats = [
        {
          label: "Total Scans",
          value: totalScans,
          change: percentChange(prevTotalScans, totalScans),
        },
        {
          label: "Unique Visitors",
          value: uniqueVisitors,
          change: percentChange(prevUniqueVisitors, uniqueVisitors),
        },
        {
          label: "Active dynamic codes",
          value: activeQrs,
          change: percentChange(prevActiveQrs, activeQrs),
        },
        {
          label: "Avg per code",
          value: avgPerCode,
          change: percentChange(prevAvgPerCode, avgPerCode),
        },
      ];

      // ================= TOP QRS =================

      const topQrsRaw = await prisma.qRScan.groupBy({
        by: ["qrId"],
        where: scanWhere,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 4,
      });

      const qrIds = topQrsRaw.map((r) => r.qrId);

      const qrs = await prisma.qRCode.findMany({
        where: { id: { in: qrIds } },
        select: { id: true, name: true, payload: true },
      });

      const topQrs = topQrsRaw.map((row) => {
        const qr = qrs.find((q) => q.id === row.qrId);
        const payload = qr?.payload as { url?: string } | null;
        return {
          id: row.qrId,
          name: qr?.name ?? "Unnamed QR",
          scans: row._count.id,
          url: payload?.url ?? null,
        };
      });

      // ================= TOP PROJECTS =================

      const topProjectsRaw = await prisma.qRScan.groupBy({
        by: ["projectId"],
        where: scanWhere,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 4,
      });

      const projectIds = topProjectsRaw.map((p) => p.projectId);

      const projects = await prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: {
          id: true,
          name: true,
          _count: { select: { qrs: true } },
        },
      });

      const topProjects = topProjectsRaw.map((row) => {
        const project = projects.find((p) => p.id === row.projectId);
        return {
          id: row.projectId,
          name: project?.name ?? "Unknown Project",
          scans: row._count.id,
          qrCount: project?._count.qrs ?? 0,
        };
      });

      // ================= RESPONSE =================

      res.json({
        stats,
        topQrs,
        topProjects,
      });
    } catch (err) {
      console.error("Analytics fetch error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
