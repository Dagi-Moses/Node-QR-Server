import axios from "axios";
import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) {
      return res.status(400).json({ error: "Missing reference" });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    if (data.status !== "success") {
      return res.status(400).json({ success: false });
    }

    // 🔑 Extract metadata you sent during init
    const { userId, planType } = data.metadata;

    if (!userId || !planType) {
      return res.status(400).json({ error: "Missing metadata" });
    }

    // 🧠 Decide subscription duration
    const now = new Date();
    let expiresAt = new Date(now);

    if (planType === "week") expiresAt.setDate(now.getDate() + 7);
    if (planType === "month") expiresAt.setMonth(now.getMonth() + 1);
    if (planType === "year") expiresAt.setFullYear(now.getFullYear() + 1);

    // ✅ Update DB
    await prisma.subscription.upsert({
      where: { userId },
      update: {
        active: true,
        planType,
        expiresAt,
        reference,
      },
      create: {
        userId,
        planType,
        active: true,
        expiresAt,
        reference,
        provider: "paystack",
        profile: {
          connect: {
            userId: userId,
          },
        },
      },
    });

    return res.json({ success: true });
  } catch (err: any) {
    console.error("Verify payment error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default router;


// import axios from "axios";
// import express from "express";

// const router = express.Router();

// router.post("/", async (req, res) => {
//   console.log(" Verify Payment called");
//   const { reference } = req.body;

//   console.log("Reference recieved ", reference);

//   const response = await axios.get(
//     `https://api.paystack.co/transaction/verify/${reference}`,
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//       },
//     }
//   );

//   console.log("Response ", response);

//   const data = response.data.data;

//   console.log("Data ", data);

//   if (data.status === "success") {
//     // activate subscription here
//     return res.json({ success: true });
//   }

//   return res.status(400).json({ success: false });
// });

// export default router;
