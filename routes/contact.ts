import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/api/contact", async (req, res) => {
  const { name, email, message, pageUrl } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Contact Form" <${process.env.MAIL_USER}>`,
      to: "nodetechnologiessolution@gmail.com",
      replyTo: email,
      subject: `New message from ${name}`,
      html: `
        <h3>New Contact Message</h3>
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
