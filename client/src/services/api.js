import axios from "axios";

// Create an axios instance with the backend URL pre-configured
// This means we don't have to type "http://localhost:5000" in every function
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Create a new payment link
export async function createLink(data) {
  const response = await api.post("/links", data);
  return response.data;
}

// Get all payment links
export async function getLinks() {
  const response = await api.get("/links");
  return response.data;
}

// Get a single payment link by ID
export async function getLink(id) {
  const response = await api.get(`/links/${id}`);
  return response.data;
}

// Trigger an M-Pesa STK push for a payment link
export async function initiatePayment(linkId, phone) {
  const response = await api.post("/pay", { linkId, phone });
  return response.data;
}

// Check if a payment has been completed (used for polling)
export async function checkPaymentStatus(linkId) {
  const response = await api.get(`/payment-status/${linkId}`);
  return response.data;
}

// Get the URL to download a receipt PDF
export function getReceiptUrl(linkId) {
  return `http://localhost:5000/api/receipts/${linkId}`;
}