// const express = require("express");
// const router = express.Router();

// // We will build these routes on Day 2
// // POST /pay -- trigger STK push
// // POST /mpesa/callback -- receive Safaricom webhook
// // GET /payment-status/:linkId -- check if payment completed

// module.exports = router;

const express = require("express");
const db = require("../db");
const { initiateSTKPush } = require("../services/mpesa");
const { generateReceipt } = require("../services/receipt");

const router = express.Router();

// POST /pay -- Trigger an M-Pesa STK Push
router.post("/pay", async (req, res) => {
  const { linkId, phone } = req.body;

  // Look up the payment link in the database
  const link = db.prepare("SELECT * FROM links WHERE id = ?").get(linkId);

  if (!link) {
    return res.status(404).json({ error: "Payment link not found" });
  }

  // Don't allow paying a link that's already been paid
  if (link.status === "paid") {
    return res.status(400).json({ error: "This link has already been paid" });
  }

  // Use the phone from the request, or fall back to the one stored in the link
  const payPhone = phone
    ? formatPhone(phone)
    : link.client_phone;

  try {
    // Create a pending payment record BEFORE calling Safaricom
    // This way, when the callback arrives, we have a record to match it to
    const stmt = db.prepare(`
      INSERT INTO payments (link_id, phone_number, amount, status)
      VALUES (?, ?, ?, 'pending')
    `);
    stmt.run(linkId, payPhone, link.amount);

    // Call Safaricom's STK Push API
    const result = await initiateSTKPush(payPhone, link.amount, linkId);

    // ResponseCode "0" means Safaricom accepted the request
    // This does NOT mean the payment succeeded -- it means the STK push was sent
    if (result.ResponseCode === "0") {
      res.json({
        message: "STK push sent. Check your phone.",
        checkoutRequestId: result.CheckoutRequestID,
      });
    } else {
      res.status(400).json({
        error: "Failed to initiate payment",
        details: result.ResponseDescription,
      });
    }
  } catch (error) {
    console.error("STK Push Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

// POST /mpesa/callback -- Safaricom calls this endpoint with the payment result
router.post("/mpesa/callback", async (req, res) => {
  // CRITICAL: Respond with 200 IMMEDIATELY, before doing any processing.
  // If you take too long or return an error, Safaricom will retry the callback,
  // and you might process the same payment twice.
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  // Extract the callback data from Safaricom's payload
  const callback = req.body.Body?.stkCallback;

  if (!callback) {
    console.error("Invalid callback payload:", req.body);
    return;
  }

  const {
    MerchantRequestID,
    CheckoutRequestID,
    ResultCode,
    ResultDesc,
    CallbackMetadata,
  } = callback;

  console.log(`Callback received: ResultCode=${ResultCode}, ${ResultDesc}`);

  // ResultCode 0 means the payment was successful
  // Any other code means failure (cancelled, wrong PIN, insufficient funds, etc.)
  if (ResultCode !== 0) {
    console.log("Payment failed or was cancelled:", ResultDesc);
    return;
  }

  // Extract the payment details from the metadata
  // Safaricom sends metadata as an array of { Name, Value } objects
  const metadata = {};
  if (CallbackMetadata?.Item) {
    CallbackMetadata.Item.forEach((item) => {
      metadata[item.Name] = item.Value;
    });
  }

  const mpesaReceipt = metadata.MpesaReceiptNumber;
  const amount = metadata.Amount;
  const transactionDate = String(metadata.TransactionDate);
  const phoneNumber = String(metadata.PhoneNumber);

  // Find the matching pending payment in our database
  // We match by phone number and amount since AccountReference gets truncated
  const payment = db
    .prepare(
      `SELECT p.*, l.id as lid FROM payments p
       JOIN links l ON p.link_id = l.id
       WHERE p.phone_number = ? AND p.amount = ? AND p.status = 'pending'
       ORDER BY p.created_at DESC LIMIT 1`
    )
    .get(phoneNumber, amount);

  if (!payment) {
    console.error("No matching pending payment found for:", {
      phoneNumber,
      amount,
    });
    return;
  }

  // Update the payment record with the M-Pesa transaction details
  db.prepare(
    `UPDATE payments
     SET mpesa_receipt = ?, transaction_date = ?, status = 'completed',
         raw_callback = ?
     WHERE id = ?`
  ).run(
    mpesaReceipt,
    transactionDate,
    JSON.stringify(req.body), // Store the full callback as JSON for debugging
    payment.id
  );

  // Mark the payment link as paid
  db.prepare("UPDATE links SET status = 'paid' WHERE id = ?").run(
    payment.link_id
  );

  // Generate a PDF receipt
  const link = db.prepare("SELECT * FROM links WHERE id = ?").get(
    payment.link_id
  );

  try {
    await generateReceipt({
      receiptNumber: mpesaReceipt,
      clientName: link.client_name,
      amount: amount,
      phone: phoneNumber,
      description: link.description,
      date: transactionDate,
      linkId: link.id,
    });
    console.log(`Receipt generated for ${mpesaReceipt}`);
  } catch (err) {
    console.error("Receipt generation failed:", err);
  }
});

// GET /payment-status/:linkId -- Check if a payment has been completed
// The frontend polls this endpoint to know when the callback has arrived
router.get("/payment-status/:linkId", (req, res) => {
  const link = db.prepare("SELECT * FROM links WHERE id = ?").get(
    req.params.linkId
  );

  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }

  const payment = db
    .prepare(
      "SELECT * FROM payments WHERE link_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(req.params.linkId);

  res.json({
    linkStatus: link.status,
    payment: payment
      ? {
          status: payment.status,
          mpesaReceipt: payment.mpesa_receipt,
        }
      : null,
  });
});

// Helper: format phone to 254XXXXXXXXX (same function from links.js)
function formatPhone(phone) {
  let cleaned = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("+254")) cleaned = cleaned.slice(1);
  else if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1);
  return cleaned;
}

module.exports = router;