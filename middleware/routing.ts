import createProfileRouter from "../routes/create-profile.js";
import checkoutRouter from "../routes/checkout.js";
import verifyPaymentRouter from "../routes/verify-payment.js";
import subscriptionRouter from "../routes/subscription.js";
import profileRouter from "../routes/profile.js";
import projectsRouter from "../routes/projects.js";
import qrCodeRouter from "../routes/qr-codes.js";

import publicFDQrRouter from "../routes/public-qrs/qr(api).js";
import publicScanQrRouter from "../routes/public-qrs/q(scan).js";

import analyticsRouter from "../routes/analytics.js";

export default function setupRoutes(app: any): void {
  app.use("/api/create-profile", createProfileRouter);
  app.use("/api/checkout", checkoutRouter);
  app.use("/api/subscription", subscriptionRouter);
  app.use("/api/profile", profileRouter);
  app.use("/", projectsRouter);
  app.use("/payments/verify", verifyPaymentRouter);
  app.use("/api", qrCodeRouter);
  app.use("/", analyticsRouter);

  app.use("/", publicFDQrRouter);
  app.use("/", publicScanQrRouter);
}
