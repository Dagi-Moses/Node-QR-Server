import { Router } from "express";
import prisma from "../../lib/prisma.js";

const router = Router();

router.get("/qrs/:qrId", async (req, res) => {
  const { qrId } = req.params;

  try {
    const qr = await prisma.qRCode.findUnique({
      where: { id: qrId },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!qr || qr.status !== "active") {
      return res.status(404).json({ message: "QR not found" });
    }

    res.json({
      id: qr.id,
      name: qr.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
