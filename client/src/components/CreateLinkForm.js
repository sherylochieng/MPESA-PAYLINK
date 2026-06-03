import { useState } from "react";

function CreateLinkForm({ onSubmit }) {
  // A single state object for all form fields
  // An alternative is separate useState calls for each field
  // This approach is cleaner when you have many fields
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    amount: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);

  // One handler for all inputs, using the input's name attribute to update the right field
  function handleChange(e) {
    setForm((prev) => ({
      ...prev,                    // Keep all existing fields
      [e.target.name]: e.target.value, // Update only the field that changed
    }));
  }

  async function handleSubmit(e) {
    // Prevent the browser from refreshing the page on form submit
    // This is the same preventDefault from Week 4 DOM events
    e.preventDefault();
    setSubmitting(true);

    try {
      const link = await onSubmit({
        ...form,
        amount: parseFloat(form.amount), // Convert string to number
      });
      setCreatedLink(link);
      // Clear the form after successful creation
      setForm({ clientName: "", clientPhone: "", amount: "", description: "" });
    } catch (err) {
      alert("Failed to create link: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(createdLink.paymentUrl);
    alert("Link copied!");
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Client Name</label>
            <input
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              required
              placeholder="e.g. John Kamau"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Phone Number</label>
            <input
              name="clientPhone"
              value={form.clientPhone}
              onChange={handleChange}
              required
              placeholder="0712 345 678"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Amount (KES)</label>
            <input
              name="amount"
              type="number"
              min="1"
              value={form.amount}
              onChange={handleChange}
              required
              placeholder="500"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Description (optional)</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Website design deposit"
              style={styles.input}
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Creating..." : "Create Payment Link"}
        </button>
      </form>

      {createdLink && (
        <div style={styles.linkBox}>
          <p style={styles.linkLabel}>Share this link with your client:</p>
          <div style={styles.linkRow}>
            <code style={styles.linkUrl}>{createdLink.paymentUrl}</code>
            <button onClick={copyLink} style={styles.copyBtn}>
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  form: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: 24,
  },
  row: {
    display: "flex",
    gap: 16,
    marginBottom: 16,
  },
  field: {
    flex: 1,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#555",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#153564",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  linkBox: {
    marginTop: 20,
    background: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderRadius: 8,
    padding: 16,
  },
  linkLabel: {
    fontSize: 13,
    color: "#065F46",
    margin: "0 0 8px 0",
  },
  linkRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  linkUrl: {
    flex: 1,
    fontSize: 13,
    background: "white",
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #D1FAE5",
    wordBreak: "break-all",
  },
  copyBtn: {
    padding: "8px 16px",
    background: "#059669",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};

export default CreateLinkForm;