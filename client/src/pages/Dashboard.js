import { useState, useEffect } from "react";
import { createLink, getLinks } from "../services/api";
import CreateLinkForm from "../components/CreateLinkForm";
import LinkList from "../components/LinkList";

function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all existing links when the component first mounts
  // This is the same useEffect-on-mount pattern from Week 8
  useEffect(() => {
    loadLinks();
  }, []); // Empty dependency array = run once on mount

  async function loadLinks() {
    try {
      const data = await getLinks();
      setLinks(data);
    } catch (err) {
      console.error("Failed to load links:", err);
    } finally {
      setLoading(false); // Stop showing "Loading..." whether it succeeded or failed
    }
  }

  // This function is passed as a prop to CreateLinkForm
  // When the form creates a new link, we add it to the top of our list
  async function handleCreateLink(formData) {
    const newLink = await createLink(formData);
    // Add the new link to the beginning of the array so it appears at the top
    setLinks((prev) => [newLink, ...prev]);
    return newLink;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Paylink</h1>
        <p style={styles.subtitle}>
          Create payment links. Get paid via M-Pesa. Instantly.
        </p>
      </header>

      <main style={styles.main}>
        <CreateLinkForm onSubmit={handleCreateLink} />

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Links</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <LinkList links={links} />
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: "#153564",
    margin: 0,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: 40,
  },
  section: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#333",
    marginBottom: 16,
  },
};

export default Dashboard;