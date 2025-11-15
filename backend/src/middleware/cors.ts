import cors from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "https://easy-make-mfu-clubs.vercel.app",
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
});
