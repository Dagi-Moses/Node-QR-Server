import { Router } from "express";
import prisma from "../../lib/prisma.js";
import { UAParser } from "ua-parser-js";

import geoip from "geoip-lite";
import crypto from "crypto";

const router = Router();

router.get("/q/:id", async (req, res) => {
  const qr = await prisma.qRCode.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      status: true,
      payload: true,
      projectId: true,
    },
  });

  if (!qr || qr.status !== "active") {
    return res.status(404).send("QR not found");
  }

  // ──────────────────────────────
  // Parse request info
  // ──────────────────────────────
  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ??
    req.socket.remoteAddress ??
    null;

  const userAgent = req.headers["user-agent"] ?? null;

  const parser = new UAParser(userAgent ?? "");
  const ua = parser.getResult();

  const geo = ip ? geoip.lookup(ip) : null;

  // ──────────────────────────────
  // Visitor fingerprint (for unique scans)
  // ──────────────────────────────
  const visitorId =
    ip && userAgent
      ? crypto
          .createHash("sha256")
          .update(ip + userAgent)
          .digest("hex")
      : null;

  // ──────────────────────────────
  // Save scan
  // ──────────────────────────────
  await prisma.qRScan.create({
    data: {
      qrId: qr.id,
      projectId: qr.projectId,

      visitorId,
      ip,
      userAgent,

      country: geo?.country ?? null,
      city: geo?.city ?? null,
      countryCode: geo?.country ?? null,

      device: ua.device.type ?? "unknown",
      os: ua.os.name ?? null,
      browser: ua.browser.name ?? null,

      referrer: req.headers.referer ?? null,
    },
  });

  // ──────────────────────────────
  // Redirect to actual URL
  // ──────────────────────────────
  if (!qr.payload || typeof qr.payload !== "object" || !("url" in qr.payload)) {
    return res.status(404).send("QR payload not found");
  }

  res.redirect((qr.payload as { url: string }).url);
});

export default router;

// import { Router } from "express";
// import prisma from "../../lib/prisma.js";
// const router = Router();

// router.get("/q/:id", async (req, res) => {
//   const qr = await prisma.qRCode.findUnique({
//     where: { id: req.params.id },
//   });

//   if (!qr || qr.status !== "active") {
//     return res.status(404).send("QR not found");
//   }

//   // 🔥 TRACK SCAN
//   await prisma.qRScan.create({
//     data: {
//       ip: req.ip,
//       qrId: qr.id,
//       userAgent: req.headers["user-agent"] ?? null,
//     },
//   });

//   // 🔁 REDIRECT
//   res.redirect(qr.payload.url);
// });

// export default router;
