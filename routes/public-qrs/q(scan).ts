import { Router } from "express";
import prisma from "../../lib/prisma.js";
const router = Router();

router.get("/q/:id", async (req, res) => {
  const qr = await prisma.qRCode.findUnique({
    where: { id: req.params.id },
  });

  if (!qr || qr.status !== "active") {
    return res.status(404).send("QR not found");
  }

  // 🔥 TRACK SCAN
  await prisma.qRScan.create({
    data: {
      ip: req.ip,
      qrId: qr.id,
      userAgent: req.headers["user-agent"] ?? null,
    },
  });

  // 🔁 REDIRECT
  res.redirect(qr.payload.url);
});

export default router;
