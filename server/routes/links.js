
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

const router = express.Router();

// POST / -- Create a new payment link
// This handles POST requests to /api/links (because index.js mounts this router at /api/links)
router.post("/", (req, res) => {
  // Destructure the fields from the request body
  // This is the same destructuring you learned in Week 3
  const { clientName, clientPhone, amount, description } = req.body;

  // --- Server-side validation ---
  // Always validate on the server, even if the frontend also validates.
  // Someone could bypass your frontend entirely using Postman or curl.
  if (!clientName || !clientPhone || !amount) {
    return res.status(400).json({
      error: "clientName, clientPhone, and amount are required",
    });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than 0" });
  }

  // Normalize the phone number to 254XXXXXXXXX format
  const phone = formatPhone(clientPhone);

  // Generate a unique ID for this payment link
  const id = uuidv4();

  // Insert into the database using a prepared statement
  const stmt = db.prepare(`
    INSERT INTO links (id, client_name, client_phone, amount, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, clientName, phone, amount, description || null);

  // Read back the newly created link (to get the created_at timestamp and defaults)
  const link = db.prepare("SELECT * FROM links WHERE id = ?").get(id);

  // Respond with the link data plus the shareable payment URL
  res.status(201).json({
    ...link,
    paymentUrl: `${process.env.APP_URL}/pay/${id}`,
  });
});

// GET / -- List all payment links
// This handles GET requests to /api/links
router.get("/", (req, res) => {
  const links = db.prepare(
    "SELECT * FROM links ORDER BY created_at DESC"
  ).all();
  res.json(links);
});

// GET /:id -- Get a single payment link by its ID
// The :id is a URL parameter, like useParams in React Router (Week 8)
router.get("/:id", (req, res) => {
  const link = db.prepare("SELECT * FROM links WHERE id = ?").get(
    req.params.id
  );

  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }

  res.json(link);
});

// Helper function: format any Kenyan phone number to 254XXXXXXXXX
// M-Pesa requires this exact format -- no plus sign, no leading zero
function formatPhone(phone) {
  // Remove spaces and non-numeric characters (except +)
  let cleaned = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");

  if (cleaned.startsWith("+254")) {
    cleaned = cleaned.slice(1); // Remove the + sign, keep 254...
  } else if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1); // Replace leading 0 with 254
  }

  return cleaned;
}

module.exports = router;