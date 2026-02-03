import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/api/contact", async (req, res) => {
  const { name, email, message, pageUrl, app } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("Missing email credentials in environment variables");
    return res.status(500).json({ error: "Email service misconfiguration" });
  }

  try {
    console.log("SMTP_USER", process.env.SMTP_USER);
    console.log("SMTP_PASS", process.env.SMTP_PASS);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Bypass strict SSL checking
        minVersion: "TLSv1.2",
      },
    });

    await transporter.sendMail({
      from: `"Contact Form" <${process.env.SMTP_USER}>`,
      to: "nodetechnologiessolution@gmail.com",
      replyTo: email,
      subject: `New Contact message from ${app}`,
      html: `
        
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Page URL:</strong> <a href="${pageUrl}">${pageUrl}</a></p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Email failed" });
  }
});

export default router;
