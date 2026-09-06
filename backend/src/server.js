const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { Server } = require("socket.io");
const pool = require("./config/db");
const { initSocket } = require("./socket");

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const superAdminRoutes = require("./routes/superadmin.routes");
const organizationRoutes = require("./routes/organization.routes");
const auctionRoutes = require("./routes/auction.routes");
const teamRoutes = require("./routes/team.routes");
const playerRoutes = require("./routes/player.routes");
const liveRoutes = require("./routes/live.routes");
const publicRoutes = require("./routes/public.routes");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const io = new Server(server, { cors: corsOptions });

initSocket(io);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files from both possible folders for compatibility.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "SportzMitra Auction API running" });
});

app.get("/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ status: "OK", db: rows[0].ok === 1 ? "connected" : "unknown" });
  } catch (error) {
    res.status(500).json({ status: "ERROR", message: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/live", liveRoutes);
app.use("/api/public", publicRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`SportzMitra Auction API running on port ${PORT}`);
});
