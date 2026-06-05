import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function AboutPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 68 }}>

        {/* HERO */}
        <section style={styles.hero}>
          <p style={styles.eyebrow}>About Paylink</p>
          <h1 style={styles.title}>
            Built by a Kenyan developer,<br />for Kenyan businesses.
          </h1>
          <p style={styles.sub}>
            A full-stack payment system integrating with Safaricom Daraja API 
            built to solve real friction in how Kenyan businesses collect money.
          </p>
        </section>

        {/* STORY */}
        <section style={styles.section}>
          <div style={styles.inner}>

            <h2 style={styles.h2}>The Problem</h2>
            <p style={styles.body}>
              Every day, Kenyan freelancers, caterers, tutors, and small business owners
              chase payments through long USSD chains  asking clients to navigate menus,
              type paybill numbers, type account references, type amounts.
              Every extra step is friction. Friction loses customers.
            </p>
            <p style={{ ...styles.body, marginBottom: 48 }}>
              Paylink removes every step between "I want to pay" and money in the account.
            </p>

            {/* Quote */}
            <div style={styles.quote}>
              <p style={styles.quoteText}>
                "A beautiful frontend that cannot collect payment is a brochure.
                A backend that can process transactions is a business."
              </p>
            </div>

            {/* Stack */}
            <h2 style={styles.h2}>The Stack</h2>
            <div style={styles.grid2}>
              {[
                { label: "Backend", items: ["Node.js + Express", "SQLite Database", "Safaricom Daraja API", "PDFKit receipts"] },
                { label: "Frontend", items: ["React", "React Router", "axios", "CSS Variables"] },
              ].map(col => (
                <div key={col.label} style={styles.stackCard}>
                  <div style={styles.stackLabel}>{col.label}</div>
                  {col.items.map(item => (
                    <div key={item} style={styles.stackItem}>
                      <span style={{ color: "var(--green)", fontWeight: 700 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Builder */}
            <h2 style={styles.h2}>The Builder</h2>
            <div style={styles.builderCard}>
              <div style={styles.avatar}>S</div>
              <div>
                <div style={styles.builderName}>Sheryl Ochieng</div>
                <div style={styles.builderRole}>Software Engineering Student · Mctaba Labs</div>
                <p style={styles.builderBio}>
                  Kenyan entrepreneur and developer building SaaS products that solve real
                  problems for African businesses. Documenting the journey publicly under
                  #BuildingWithSheryl.
                </p>
                <Link to="/dashboard" style={styles.btnGreen}>Try Paylink →</Link>
              </div>
            </div>

          </div>
        </section>

      </div>
    </>
  );
}

const styles = {
  hero: {
    background: "linear-gradient(135deg, var(--white) 0%, #F0F7F4 100%)",
    padding: "80px 24px",
    borderBottom: "1px solid var(--border)",
    textAlign: "center",
  },
  eyebrow: {
    fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "var(--green)",
    marginBottom: 16,
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(32px, 4vw, 44px)",
    fontWeight: 700, color: "var(--ink)",
    marginBottom: 20, lineHeight: 1.25,
  },
  sub: {
    fontSize: 17, color: "var(--ink-soft)",
    lineHeight: 1.8, maxWidth: 580, margin: "0 auto",
  },
  section: { padding: "80px 24px" },
  inner: { maxWidth: 720, margin: "0 auto" },
  h2: {
    fontFamily: "var(--font-display)",
    fontSize: 30, fontWeight: 700,
    color: "var(--ink)", marginBottom: 20, marginTop: 0,
  },
  body: {
    fontSize: 16, color: "var(--ink-soft)",
    lineHeight: 1.85, marginBottom: 16,
  },
  quote: {
    background: "var(--green)",
    borderRadius: "var(--radius-lg)",
    padding: 40, marginBottom: 48,
  },
  quoteText: {
    fontFamily: "var(--font-display)",
    fontSize: 22, color: "white",
    lineHeight: 1.6, margin: 0, fontStyle: "italic",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48 },
  stackCard: {
    background: "white", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: 24,
    borderLeft: "4px solid var(--mustard)",
  },
  stackLabel: {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--mustard-dark)", marginBottom: 16,
  },
  stackItem: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "8px 0", borderBottom: "1px solid var(--border)",
    fontSize: 14, color: "var(--ink-soft)",
  },
  builderCard: {
    background: "white", border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)", padding: 32,
    display: "flex", gap: 24, alignItems: "flex-start",
  },
  avatar: {
    width: 64, height: 64, borderRadius: "50%",
    background: "var(--green)", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-display)", fontSize: 24,
    fontWeight: 700, color: "var(--mustard)",
  },
  builderName: { fontWeight: 700, fontSize: 18, color: "var(--ink)", marginBottom: 4 },
  builderRole: { fontSize: 13, color: "var(--mustard-dark)", fontWeight: 600, marginBottom: 12 },
  builderBio: { fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7, marginBottom: 20 },
  btnGreen: {
    display: "inline-block", padding: "10px 24px",
    background: "var(--green)", color: "white",
    borderRadius: "var(--radius-sm)", textDecoration: "none",
    fontSize: 14, fontWeight: 600, fontFamily: "var(--font-body)",
  },
};

export default AboutPage;