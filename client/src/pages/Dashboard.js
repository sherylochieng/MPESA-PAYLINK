import { useState, useEffect } from "react";
import { createLink, getLinks } from "../services/api";
import CreateLinkForm from "../components/CreateLinkForm";
import LinkList from "../components/LinkList";
import Navbar from "../components/Navbar";

function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    try {
      const data = await getLinks();
      setLinks(data);
    } catch (err) {
      console.error("Failed to load links:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLink(formData) {
    const newLink = await createLink(formData);
    setLinks((prev) => [newLink, ...prev]);
    return newLink;
  }

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 88 }}>
        <div style={styles.container}>
          <header style={styles.header}>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>
              Create payment links. Get paid via M-Pesa. Instantly.
            </p>
          </header>
          <main style={styles.main}>
            <CreateLinkForm onSubmit={handleCreateLink} />
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Your Links</h2>
              {loading ? <p>Loading...</p> : <LinkList links={links} />}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 720, margin: "0 auto", padding: "40px 20px",
    fontFamily: "var(--font-body)",
  },
  header: { marginBottom: 40 },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: 32, fontWeight: 700,
    color: "var(--green)", margin: 0,
  },
  subtitle: { fontSize: 16, color: "var(--ink-muted)", marginTop: 8 },
  main: { display: "flex", flexDirection: "column", gap: 40 },
  section: {},
  sectionTitle: {
    fontSize: 18, fontWeight: 600,
    color: "var(--ink)", marginBottom: 16,
    fontFamily: "var(--font-display)",
  },
};

export default Dashboard;