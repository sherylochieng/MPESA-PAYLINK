// require("dotenv").config(); // Load .env variables into process.env
// const express = require("express");
// const cors = require("cors");

// const linkRoutes = require("./routes/links");
// const paymentRoutes = require("./routes/payments");
// const receiptRoutes = require("./routes/receipts");

// const app = express();

// // Middleware -- these run on EVERY request before your route handlers
// app.use(cors());          // Allow React on port 3000 to call this server on port 5000
// app.use(express.json());  // Parse incoming JSON request bodies so req.body works

// // Mount route files at their URL paths
// app.use("/api/links", linkRoutes);
// app.use("/api", paymentRoutes);
// app.use("/api/receipts", receiptRoutes);

// // A simple health check -- hit this to confirm the server is running
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", timestamp: new Date().toISOString() });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


require("dotenv").config(); // Load .env variables into process.env
const express = require("express");
const cors = require("cors");

const linkRoutes = require("./routes/links");
const paymentRoutes = require("./routes/payments");
const receiptRoutes = require("./routes/receipts");

const app = express();

// Middleware -- these run on EVERY request before your route handlers
app.use(cors());          // Allow React on port 3000 to call this server on port 5000
app.use(express.json());  // Parse incoming JSON request bodies so req.body works

// Mount route files at their URL paths
app.use("/api/links", linkRoutes);
app.use("/api", paymentRoutes);
// app.use("/api/receipts", receiptRoutes);

// A simple health check -- hit this to confirm the server is running
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});