import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function HomePage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 68 }}>

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.heroBg} />
          <div style={styles.heroContent}>
            <div style={styles.badge}>
              <span style={styles.badgeDot} />
              Built for Kenyan Businesses
            </div>
            <h1 style={styles.heroTitle}>
              Get Paid via M-Pesa.<br />
              <span style={{ color: "var(--mustard)" }}>No Friction. No Delays.</span>
            </h1>
            <p style={styles.heroSub}>
              Create a payment link in seconds. Share it with your client.
              They tap Pay, enter their PIN — money is in your account.
            </p>
            <div style={styles.heroButtons}>
              <Link to="/dashboard" style={styles.btnMustard}>Create Your First Link →</Link>
              <Link to="/about" style={styles.btnOutline}>Learn More</Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={styles.section}>
          <div style={styles.sectionInner}>
            <p style={styles.eyebrow}>How It Works</p>
            <h2 style={styles.sectionTitle}>Three steps to getting paid</h2>
            <div style={styles.grid3}>
              {[
                { num: "01", icon: "🔗", title: "Create a Link", desc: "Enter client name, phone, and amount. A unique payment URL is generated instantly." },
                { num: "02", icon: "📱", title: "Share & Pay", desc: "Share via WhatsApp. Client opens the link, M-Pesa STK Push is sent to their phone." },
                { num: "03", icon: "📄", title: "Get Your Receipt", desc: "Client enters PIN, payment confirmed, branded PDF receipt generated automatically." },
              ].map(step => (
                <div key={step.num} style={styles.featureCard}>
                  <div style={styles.stepNum}>{step.num}</div>
                  <div style={styles.stepIcon}>{step.icon}</div>
                  <h3 style={styles.cardTitle}>{step.title}</h3>
                  <p style={styles.cardDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={styles.cta}>
          <h2 style={styles.ctaTitle}>Ready to reduce payment friction?</h2>
          <p style={styles.ctaSub}>Join businesses across Kenya collecting payments the smart way.</p>
          <Link to="/dashboard" style={styles.btnMustard}>Start Creating Links</Link>
        </section>

      </div>
    </>
  );
}

const styles = {
  hero: {
    minHeight: "92vh",
    background: "var(--green)",
    display: "flex", alignItems: "center", justifyContent: "center",
    textAlign: "center", padding: "80px 24px",
    position: "relative", overflow: "hidden",
  },
  heroBg: {
    position: "absolute", inset: 0,
    backgroundImage: "radial-gradient(circle at 20% 50%, rgba(212,160,23,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(64,145,108,0.3) 0%, transparent 40%)",
    pointerEvents: "none",
  },
  heroContent: { position: "relative", maxWidth: 720 },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(212,160,23,0.15)",
    border: "1px solid rgba(212,160,23,0.3)",
    borderRadius: 20, padding: "6px 16px",
    color: "#F0C842", fontSize: 13, fontWeight: 500,
    marginBottom: 28,
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "var(--mustard)", display: "inline-block",
  },
  heroTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(36px, 5vw, 60px)",
    fontWeight: 700, color: "white",
    lineHeight: 1.15, marginBottom: 24, margin: "0 0 24px",
  },
  heroSub: {
    fontSize: 18, color: "rgba(255,255,255,0.72)",
    maxWidth: 500, margin: "0 auto 40px",
    lineHeight: 1.7,
  },
  heroButtons: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" },
  btnMustard: {
    padding: "14px 32px", background: "var(--mustard)",
    color: "white", borderRadius: "var(--radius-sm)",
    textDecoration: "none", fontSize: 15, fontWeight: 600,
    fontFamily: "var(--font-body)", display: "inline-block",
  },
  btnOutline: {
    padding: "13px 32px", background: "transparent",
    color: "white", border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "var(--radius-sm)", textDecoration: "none",
    fontSize: 15, fontWeight: 600, fontFamily: "var(--font-body)",
    display: "inline-block",
  },
  section: { padding: "100px 24px", background: "var(--white)" },
  sectionInner: { maxWidth: 1000, margin: "0 auto" },
  eyebrow: {
    fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "var(--mustard-dark)",
    marginBottom: 12, textAlign: "center",
  },
  sectionTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 38, fontWeight: 700,
    color: "var(--ink)", textAlign: "center", marginBottom: 56,
  },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 },
  featureCard: {
    background: "white", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: 32,
    transition: "var(--transition)",
  },
  stepNum: {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
    color: "var(--mustard-dark)", marginBottom: 16,
  },
  stepIcon: { fontSize: 32, marginBottom: 16 },
  cardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 20, fontWeight: 600,
    color: "var(--ink)", marginBottom: 12,
  },
  cardDesc: { fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7 },
  cta: {
    background: "var(--green)", padding: "80px 24px",
    textAlign: "center",
  },
  ctaTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 36, fontWeight: 700,
    color: "white", marginBottom: 16,
  },
  ctaSub: { color: "rgba(255,255,255,0.7)", marginBottom: 32, fontSize: 16 },
};

export default HomePage;