const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const RECEIPTS_DIR = path.join(__dirname, "..", "receipts");

// GET /:linkId -- Download the PDF receipt for a payment link
router.get("/:linkId", (req, res) => {
  const filePath = path.join(RECEIPTS_DIR, `${req.params.linkId}.pdf`);

  // Check if the receipt file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Receipt not found" });
  }

  // res.download() sets the right headers so the browser downloads the file
  // instead of trying to display it inline
  res.download(filePath, `receipt-${req.params.linkId.slice(0, 8)}.pdf`);
});

module.exports = router;