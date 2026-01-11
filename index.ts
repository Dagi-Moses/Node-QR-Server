import "dotenv/config";
import express from "express";
import setupRoutes from "./middleware/routing.ts";
import cors from "cors";
import bodyParser from "body-parser";

const PORT = 4000;

const app = express();
app.use((req, _res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
// app.use(cors());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("Server is running! 🚀");
});

setupRoutes(app);

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
  console.log("Environment", process.env.NODE_ENV);

});
