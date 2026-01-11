import createProfileRouter from "../routes/create-profile.js";
import checkoutRouter from "../routes/checkout.js";
import verifyPaymentRouter from "../routes/verify-payment.js";
import subscriptionRouter from "../routes/subscription.js";

export default function setupRoutes(app: any): void {
  app.use("/api/create-profile", createProfileRouter);
  app.use("/api/checkout", checkoutRouter);
  app.use("/api/subscription", subscriptionRouter);
  app.use("/payments/verify", verifyPaymentRouter);
}
