// const express = require('express');
// const { v4: uuidv4 } = require('uuid');
// const db = require('../db');

// const router = express.Router();

// // POST / -- Create a new payment link
// // This handles POST requests to /api/links (because index.js mounts this router at /api/links)
// router.post('/', (req, res) => {
//   // Destructure the fields from the request body
//   // This is the same destructuring you learned in Week 3
//   const { clientName, clientPhone, amount, description } = req.body;

//   // --- Server-side validation ---
//   // Always validate on the server, even if the frontend also validates.
//   // Someone could bypass your frontend entirely using Postman or curl.
//   if (!clientName || !clientPhone || !amount) {
//     return res.status(400).json({
//       error: 'clientName, clientPhone, and amount are required',
//     });
//   }

//   if (amount <= 0) {
//     return res.status(400).json({ error: 'Amount must be greater than 0' });
//   }

//   // Normalize the phone number to 254XXXXXXXXX format
//   const phone = formatPhone(clientPhone);

//   // Generate a unique ID for this payment link
//   const id = uuidv4();

//   // Insert into the database using a prepared statement
//   //this is a prepared SQL Statement
//   const stmt = db.prepare(`
//     INSERT INTO links (id, client_name, client_phone, amount, description)
//     VALUES (?, ?, ?, ?, ?)
//   `);

//   //execute the statement with the provided values. The stmt.run() method will replace the question marks in the SQL query with the values in the order they are provided. This helps prevent SQL injection attacks by ensuring that the values are properly escaped.
//   stmt.run(id, clientName, phone, amount, description || null);

//   // Read back the newly created link (to get the created_at timestamp and defaults)

//   // This is a simple SELECT query to retrieve the link we just created using its unique ID. The db.prepare() method prepares the SQL statement, and the .get(id) method executes it with the provided ID parameter, returning a single row from the database as an object.
//   // The resulting link object will contain all the fields from the links table, including id, client_name, client_phone, amount, description, status, and created_at. We will use this data to respond to the client with the details of the newly created payment link.
//   // The reason we read back the link instead of just constructing the response from the input data is to ensure that we include any default values set by the database (like status and created_at) and to confirm that the data was inserted correctly.
//   const link = db.prepare('SELECT * FROM links WHERE id = ?').get(id);

//   // Respond with the link data plus the shareable payment URL
//   // The payment URL is what the client will share with their customer. It should point to a frontend page that can display the payment details and trigger the M-Pesa STK push when the customer clicks "Pay Now". We construct this URL using an environment variable for the app's base URL (e.g., http://localhost:3000) and appending /pay/:id where :id is the unique ID of the payment link. This way, the frontend can use the ID to fetch the link details and initiate the payment process.
//   // We send a 201 Created status code to indicate that a new resource was successfully created, and we include the link data and payment URL in the JSON response body.
//   // The response will look like this:
//   // {
//   //   "id": "some-uuid",
//   //   "client_name": "John Doe",
//   //   "client_phone": "254712345678",
//   //   "amount": 1000,
//   //   "description": "Payment for services",
//   //   "status": "pending",
//   //   "created_at": "2024-06-01T12:00:00.000Z",
//   //   "paymentUrl": "http://localhost:3000/pay/some-uuid"
//   // } This allows the client to easily share the payment link with their customer and track its status.
//   // Note: In a real application, you would also want to handle errors that might occur during database operations and respond with appropriate status codes and messages. For simplicity, this example assumes that all operations succeed.
//   res.status(201).json({
//     ...link,
//     paymentUrl: `${process.env.APP_URL}/pay/${id}`,
//   });
// });

// // GET / -- List all payment links
// // This handles GET requests to /api/links
// // We will build more routes on Day 2, but this is a simple one to get us started and test that our database and server are working.
// // This route will return a list of all payment links in the database, ordered by creation date (newest first). The frontend can use this to display a dashboard of all links, or we can test it with Postman to confirm that our database is set up correctly and that we can read data from it.
// // The db.prepare() method prepares the SQL statement, and the .all() method executes it and returns all rows as an array of objects. Each object in the array represents a payment link with its corresponding fields from the database.
// // The response will look like this:
// // [
// //   {
// //     "id": "some-uuid",
// //     "client_name": "John Doe",
// //     "client_phone": "254712345678",
// //     "amount": 1000,
// //     "description": "Payment for services",
// //     "status": "pending",
// //     "created_at": "2024-06-01T12:00:00.000Z"
// //   },
// //   {
// //     "id": "another-uuid",
// //     "client_name": "Jane Smith",
// //     "client_phone": "254798765432",
// //     "amount": 500,
// //     "description": "Consultation fee",
// //     "status": "pending",
// //     "created_at": "2024-06-02T09:30:00.000Z"
// //   }
// // ]
// // This allows the frontend to display a list of all payment links and their details. In a real application, you would likely want to add pagination to this route if you expect a large number of links, but for simplicity, this example returns all links at once.
// // Note: In a production application, you would also want to implement authentication and authorization to ensure that only authorized users can create and view payment links. For this example, we are keeping it open for simplicity.

// router.get('/', (req, res) => {
//   const links = db
//     .prepare('SELECT * FROM links ORDER BY created_at DESC')
//     .all();
//   res.json(links);
// });

// // GET /:id -- Get a single payment link by its ID
// // The :id is a URL parameter, like useParams in React Router (Week 8)
// // This route allows the frontend to fetch the details of a single payment link using its unique ID. This is useful for the payment page where the customer will see the payment details and click "Pay Now". The frontend can call this route with the ID from the URL to get the link information and display it to the customer before initiating the payment process.
// // The db.prepare() method prepares the SQL statement, and the .get(req.params.id) method executes it with the provided ID parameter, returning a single row from the database as an object. If no link is found with that ID, we return a 404 Not Found error. Otherwise, we return the link data as JSON.
// // The response will look like this:
// // {
// //   "id": "some-uuid",
// //   "client_name": "John Doe",
// //   "client_phone": "254712345678",
// //   "amount": 1000,
// //   "description": "Payment for services",
// //   "status": "pending",
// //   "created_at": "2024-06-01T12:00:00.000Z"
// // }
// // This allows the frontend to display the payment details to the customer and proceed with the payment process.
// // Note: In a real application, you would also want to handle errors that might occur during database operations and respond with appropriate status codes and messages. For simplicity, this example assumes that all operations succeed.
// // Additionally, you might want to restrict access to this route so that only the intended customer can view the payment details, but for this example, we are keeping it open for simplicity.
// // We will build more routes on Day 2, such as updating the link status when payment is completed, and generating PDF receipts. For now, these basic routes allow us to create and view payment links in our database.
// // Note: The actual payment processing and receipt generation will be handled in the payments.js and receipts.js route files, which we will build on Day 2. This links.js file is focused on managing the payment links themselves, while the other files will handle the payment transactions and receipt generation logic.
// // In summary, this links.js route file provides the core functionality for creating and managing payment links in our M-Pesa Paylink application. It allows us to create new links, list all links, and retrieve individual link details, which are essential for the frontend to display and manage payment links effectively.

// router.get('/:id', (req, res) => {
//   const link = db
//     .prepare('SELECT * FROM links WHERE id = ?')
//     .get(req.params.id);

//   if (!link) {
//     return res.status(404).json({ error: 'Link not found' });
//   }

//   res.json(link);
// });

// // Helper function: format any Kenyan phone number to 254XXXXXXXXX
// // M-Pesa requires this exact format -- no plus sign, no leading zero
// function formatPhone(phone) {
//   // Remove spaces and non-numeric characters (except +)
//   let cleaned = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');

//   if (cleaned.startsWith('+254')) {
//     cleaned = cleaned.slice(1); // Remove the + sign, keep 254...
//   } else if (cleaned.startsWith('0')) {
//     cleaned = '254' + cleaned.slice(1); // Replace leading 0 with 254
//   }

//   return cleaned;
// }

// module.exports = router;

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