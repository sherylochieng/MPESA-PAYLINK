# Paylink-M-Pesa Payment Links for Kenyan Businesses

> *Create a payment link. Share it. Get paid via M-Pesa. Instantly.*

---

## 🇰🇪 What Is Paylink?

Paylink is a web application that helps business owners generate unique payment links for their clients. When a client opens the link, an STK Push prompt is automatically sent to their phone. They enter their M-Pesa PIN and payment is confirmed  no paybill navigation, no manual amount entry, no room for error.

A branded PDF receipt is generated automatically after every successful payment.

---

## 💡 Why It Exists

The traditional M-Pesa paybill payment process is tedious:

1. Customer opens USSD menu
2. Navigates to Lipa Na M-Pesa
3. Types paybill number (risk of wrong number)
4. Types account reference
5. Types amount (risk of wrong amount)
6. Enters PIN

Every extra step is friction. Friction loses customers.

Paylink reduces this to **one step** — enter your PIN. Everything else is handled automatically. Less friction = more completed payments = more revenue for the business owner.

---

## 🏗️ Architecture

```
Business Owner (Dashboard)         Client (Payment Page)
        │                                   │
        │ Creates link                      │ Opens link URL
        ▼                                   ▼
┌───────────────────────────────────────────────────┐
│                React Frontend (Port 3000)          │
│  Dashboard.js     │     PaymentPage.js             │
│  CreateLinkForm   │     Status polling             │
│  LinkList         │     Receipt download           │
└───────────────────────────────────────────────────┘
                    │
                    │ REST API calls
                    ▼
┌───────────────────────────────────────────────────┐
│              Express Backend (Port 5000)           │
│                                                    │
│  POST /api/links         → create payment link     │
│  GET  /api/links         → list all links          │
│  GET  /api/links/:id     → get single link         │
│  POST /api/pay           → trigger STK Push        │
│  POST /api/mpesa/callback → receive webhook        │
│  GET  /api/payment-status/:id → check status       │
│  GET  /api/receipts/:id  → download PDF            │
└───────────────────────────────────────────────────┘
                    │                    ▲
                    │ OAuth + STK Push   │ Webhook callback
                    ▼                    │
         Safaricom Daraja API ───────────┘
                    │
                    ▼
              SQLite Database
         (links + payments tables)
```

---

## 🔄 Payment Flow

```
1. Business owner fills form → creates payment link with unique UUID
2. Shares link URL with client via WhatsApp/email
3. Client opens URL → sees payment page with amount pre-filled
4. Client clicks Pay → server calls Daraja STK Push API
5. M-Pesa prompt appears on client's phone
6. Client enters PIN → Safaricom processes payment
7. Safaricom sends webhook callback to server
8. Server updates database → status = "paid"
9. Server generates branded PDF receipt
10. Payment page shows success + receipt download ✅
```

---

##  Tech Stack

### Backend
- **Node.js + Express** — REST API server
- **SQLite (better-sqlite3)** — database
- **Safaricom Daraja API** — M-Pesa STK Push integration
- **PDFKit** — PDF receipt generation
- **axios** — HTTP client for Daraja API calls
- **uuid** — unique payment link IDs

### Frontend
- **React** — UI framework
- **React Router** — client-side routing
- **axios** — API calls to backend

### Tools
- **ngrok** — expose localhost for Daraja webhooks during development
- **nodemon** — auto-restart server during development
- **dotenv** — environment variable management

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A Safaricom Daraja sandbox account ([developer.safaricom.co.ke](https://developer.safaricom.co.ke))
- ngrok ([ngrok.com](https://ngrok.com))

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/mpesa-paylink.git
cd mpesa-paylink
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create `server/.env` from the example:

```bash
cp .env.example .env
```

Fill in your Daraja sandbox credentials in `.env`:

```
PORT=5000
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok-free.dev/api/mpesa/callback
APP_URL=http://localhost:3000
```

### 3. Set up the frontend

```bash
cd ../client
npm install
```

### 4. Run the application

You need three terminals running simultaneously:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```

**Terminal 3 — ngrok tunnel:**
```bash
ngrok http 5000
```

After ngrok starts:
1. Copy the `https://` forwarding URL
2. Update `MPESA_CALLBACK_URL` in `server/.env`
3. Restart the backend server

### 5. Open the app

Visit `http://localhost:3000` in your browser.

---

##  Testing the Payment Flow

1. Open `http://localhost:3000` — you should see the Paylink dashboard
2. Fill in the form: client name, phone number, amount, description
3. Click **"Create Payment Link"** — a unique URL is generated
4. Copy the URL and open it in a new tab — the payment page appears
5. Click **"Pay"** — STK Push is sent to the phone number
6. In sandbox, simulate the callback via Postman to `/api/mpesa/callback`
7. Payment page updates to show success + receipt download

### Simulating a callback in Postman

```
POST http://localhost:5000/api/mpesa/callback
Content-Type: application/json

{
  "Body": {
    "stkCallback": {
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 1 },
          { "Name": "MpesaReceiptNumber", "Value": "NLJ7RT61SV" },
          { "Name": "TransactionDate", "Value": 20260529143840 },
          { "Name": "PhoneNumber", "Value": 254708374149 }
        ]
      }
    }
  }
}
```

---

## 📁 Project Structure

```
mpesa-paylink/
├── server/
│   ├── index.js              → Express app entry point
│   ├── db.js                 → SQLite database setup
│   ├── .env                  → Environment variables (not committed)
│   ├── .env.example          → Environment variable template
│   ├── routes/
│   │   ├── links.js          → Payment link CRUD endpoints
│   │   ├── payments.js       → STK Push + webhook + status polling
│   │   └── receipts.js       → PDF receipt download
│   ├── services/
│   │   ├── mpesa.js          → Daraja API integration
│   │   └── receipt.js        → PDF generation with PDFKit
│   └── receipts/             → Generated PDF files (auto-created)
│
└── client/
    └── src/
        ├── App.js             → React Router setup
        ├── pages/
        │   ├── Dashboard.js   → Business owner dashboard
        │   └── PaymentPage.js → Client payment page
        ├── components/
        │   ├── CreateLinkForm.js → Payment link creation form
        │   └── LinkList.js       → List of payment links
        └── services/
            └── api.js         → Backend API service layer
```

---

##  Security Features

- M-Pesa credentials stored in `.env` — never committed to Git
- OAuth token caching with automatic refresh
- SQL injection protection via prepared statement placeholders
- UUID payment link IDs — impossible to guess
- Amount read from database — customers cannot manipulate it
- Server-side validation independent of frontend
- Idempotency guards prevent double payment processing
- Raw callback storage for payment reconciliation

---

##  Real World Applications

This project implements patterns used by real fintech companies:

| Company | What They Built |
|---|---|
| Pesapal | Payment links for Kenyan businesses |
| IntaSend | Developer-friendly M-Pesa integration |
| Kopokopo | Payment collection tools for SMEs |

The patterns learned here — OAuth, STK Push, webhooks, async payment flows — transfer directly to Stripe, Flutterwave, Paystack, and any payment provider globally.

---

##  Known Issues

- Receipt generation has an Express 5 compatibility issue (fix in progress)
- ngrok URL must be manually updated in `.env` after each restart

---

##  Future Improvements

- [ ] Fix receipt generation (Express 5 async compatibility)
- [ ] WhatsApp link sharing (`wa.me` URL generation)
- [ ] Payment link expiry (24-hour timeout)
- [ ] Email receipts via Nodemailer
- [ ] WebSocket updates (replace polling with Socket.io)
- [ ] CSV export of transaction history
- [ ] Multiple payment methods (Stripe + M-Pesa)
- [ ] Merchant analytics dashboard
- [ ] Production deployment (Railway + Vercel)
- [ ] AWS S3 for receipt storage at scale

---

## About

Built by **Sheryl Ochieng** 

Follow the build journey: **#BuildingWithSheryl**

---

*"A frontend that can't collect payment is a brochure. A backend that can process transactions is a business."*
