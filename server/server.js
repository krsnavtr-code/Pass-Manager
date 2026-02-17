const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");
const dns = require("dns");
const errorHandler = require("./middleware/errorHandler.js");

// Only set DNS in development/local environment
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

// Environment variables load karo
dotenv.config();

// Database connection
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Password Manager API is running..." });
});

// Import routes
const authRoutes = require("./routes/auth.js");
const passwordRoutes = require("./routes/passwords.js");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/passwords", passwordRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
