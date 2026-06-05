import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  getLink,
  initiatePayment,
  checkPaymentStatus,
  getReceiptUrl,
} from "../services/api";

function PaymentPage() {
  // Extract the linkId from the URL using useParams (Week 8 React Router)
  const { linkId } = useParams();

  const [link, setLink] = useState(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  // Status tracks where we are in the payment flow:
  // "idle" -- waiting for user to click Pay
  // "processing" -- STK push request sent, waiting for Safaricom to respond
  // "polling" -- STK push confirmed sent, now polling for payment completion
  // "paid" -- payment confirmed
  // "failed" -- something went wrong
  const [status, setStatus] = useState("idle");

  // useRef stores the polling interval ID without causing re-renders
  // useState would trigger a re-render every time we store the interval ID,
  // which we don't need -- we just need to remember it so we can clear it later
  const pollingRef = useRef(null);

  // Load the payment link details when the component mounts
  useEffect(() => {
    loadLink();

    // Cleanup: stop polling if the user navigates away before payment completes
    // This is the useEffect cleanup function from Week 8
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [linkId]);

  async function loadLink() {
    try {
      const data = await getLink(linkId);
      setLink(data);
      // Pre-fill the phone input with the number stored in the link
      setPhone(formatInputPhone(data.client_phone));

      // If this link was already paid, show the success state immediately
      if (data.status === "paid") {
        setStatus("paid");
      }
    } catch (err) {
      setError("This payment link is invalid or has expired.");
    }
  }

  async function handlePay() {
    setStatus("processing");
    setError("");

    try {
      // Call our backend to trigger the STK push
      await initiatePayment(linkId, phone);
      setStatus("polling");

      // Now poll the backend every 3 seconds to check if the payment completed
      // The backend receives the callback from Safaricom independently,
      // so we need to keep checking until the status changes
      let attempts = 0;
      const maxAttempts = 40; // 40 attempts x 3 seconds = 2 minutes max

      pollingRef.current = setInterval(async () => {
        attempts++;

        try {
          const result = await checkPaymentStatus(linkId);

          if (result.linkStatus === "paid") {
            // Payment confirmed! Stop polling and show success
            clearInterval(pollingRef.current);
            setStatus("paid");
          } else if (attempts >= maxAttempts) {
            // Timed out after 2 minutes
            clearInterval(pollingRef.current);
            setStatus("idle");
            setError(
              "Payment timed out. If you completed the payment, refresh the page."
            );
          }
        } catch {
          // If a single poll request fails, keep trying -- don't stop the whole flow
        }
      }, 3000);
    } catch (err) {
      setStatus("idle");
      setError(
        err.response?.data?.error || "Failed to initiate payment. Try again."
      );
    }
  }

  // Convert the stored 254XXXXXXXXX format back to 0XXX XXX XXX for display
  function formatInputPhone(p) {
    if (!p) return "";
    const s = String(p);
    if (s.startsWith("254")) {
      return "0" + s.slice(3);
    }
    return s;
  }

  // Error state: invalid or expired link
  if (error && !link) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (!link) {
    return (
      <div style={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header: shows the amount and payment details */}
        <div style={styles.cardHeader}>
          <p style={styles.label}>Payment Request</p>
          <h1 style={styles.amount}>
            KES {Number(link.amount).toLocaleString()}
          </h1>
          {link.description && (
            <p style={styles.description}>{link.description}</p>
          )}
          <p style={styles.meta}>To: {link.client_name}</p>
        </div>

        {/* Body: either the payment form or the success message */}
        <div style={styles.cardBody}>
          {status === "paid" ? (
            <div style={styles.successBox}>
              <div style={styles.checkmark}>&#10003;</div>
              <h2 style={styles.successTitle}>Payment Successful</h2>
              <p style={styles.successText}>
                Your M-Pesa payment has been confirmed.
              </p>
              <a
                href={getReceiptUrl(linkId)}
                style={styles.downloadBtn}
                target="_blank"
                rel="noreferrer"
              >
                Download Receipt
              </a>
            </div>
          ) : (
            <>
              <label style={styles.inputLabel}>M-Pesa Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
                style={styles.input}
                disabled={status !== "idle"}
              />

              {error && <p style={styles.errorText}>{error}</p>}

              <button
                onClick={handlePay}
                disabled={status !== "idle" || !phone}
                style={{
                  ...styles.payBtn,
                  opacity: status !== "idle" ? 0.6 : 1,
                }}
              >
                {status === "processing"
                  ? "Sending STK Push..."
                  : status === "polling"
                  ? "Waiting for confirmation..."
                  : `Pay KES ${Number(link.amount).toLocaleString()}`}
              </button>

              {status === "polling" && (
                <p style={styles.pollingText}>
                  Check your phone for the M-Pesa prompt. Enter your PIN to
                  complete the payment.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <p style={styles.footer}>Secured by M-Pesa &bull; Powered by Paylink</p>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #F0F7F4 0%, var(--white) 100%)",
    padding: 20,
    fontFamily: "var(--font-body)",
  },
  card: {
    background: "white",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
    width: "100%",
    maxWidth: 420,
    overflow: "hidden",
  },
  cardHeader: {
    background: "var(--green)",
    backgroundImage: "radial-gradient(circle at 80% 20%, rgba(64,145,108,0.4) 0%, transparent 50%)",
    color: "white",
    padding: "32px 24px",
    textAlign: "center",
  },
  label: {
    fontSize: 11,
    opacity: 0.7,
    margin: "0 0 8px",
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: 600,
  },
  amount: {
    fontSize: 40,
    fontWeight: 700,
    margin: "0 0 8px",
    fontFamily: "var(--font-display)",
    color: "var(--mustard-light)",
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    margin: "0 0 4px",
  },
  meta: {
    fontSize: 13,
    opacity: 0.6,
    margin: 0,
  },
  cardBody: {
    padding: 28,
  },
  inputLabel: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--ink-soft)",
    marginBottom: 8,
    fontFamily: "var(--font-body)",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    fontSize: 16,
    boxSizing: "border-box",
    marginBottom: 16,
    outline: "none",
    fontFamily: "var(--font-body)",
    color: "var(--ink)",
    transition: "var(--transition)",
  },
  payBtn: {
    width: "100%",
    padding: 14,
    background: "var(--mustard)",
    color: "white",
    border: "none",
    borderRadius: "var(--radius-sm)",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    transition: "var(--transition)",
  },
  pollingText: {
    fontSize: 13,
    color: "var(--ink-muted)",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 1.6,
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    marginBottom: 12,
  },
  successBox: {
    textAlign: "center",
    padding: "20px 0",
  },
  checkmark: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "var(--green-pale)",
    color: "var(--green)",
    fontSize: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--green)",
    margin: "0 0 8px",
    fontFamily: "var(--font-display)",
  },
  successText: {
    fontSize: 14,
    color: "var(--ink-soft)",
    margin: "0 0 20px",
  },
  downloadBtn: {
    display: "inline-block",
    padding: "10px 24px",
    background: "var(--mustard)",
    color: "white",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    fontFamily: "var(--font-body)",
  },
  errorCard: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "var(--radius-md)",
    padding: 24,
    maxWidth: 400,
    textAlign: "center",
    color: "#991B1B",
  },
  footer: {
    fontSize: 12,
    color: "var(--ink-muted)",
    marginTop: 24,
    fontFamily: "var(--font-body)",
  },
};

export default PaymentPage;