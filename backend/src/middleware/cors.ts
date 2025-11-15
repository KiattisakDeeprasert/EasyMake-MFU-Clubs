import cors from "cors";

export const corsMiddleware = cors({
  origin: [
    "http://localhost:3000",
    "https://easy-make-mfu-clubs.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
