import React, { useState, useEffect } from "react";
import "./App.css";

// Utility to get backend API base URL from .env config (top-level so all components use it)
const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  "https://vscode-internal-5302-qa.qa01.cloud.kavia.ai:3001";

// Useful theme colors - can be reused in inline style if needed
const THEME = {
  primary: "#1976d2",
  accent: "#ff9800",
  secondary: "#424242",
};

/** 
 * Header navigation bar
 * Modern, minimal and responsive
 */
function Header({ activeView, setActiveView }) {
  return (
    <header
      style={{
        background: THEME.primary,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 2rem",
        fontWeight: "bold",
        letterSpacing: "1px",
      }}
    >
      <span style={{ fontSize: "1.4rem" }}>🔧 Support Ticket System</span>
      <nav>
        <button
          style={{
            background: activeView === "form" ? THEME.accent : "transparent",
            border: "none",
            color: "#fff",
            fontSize: "1rem",
            padding: "0.5rem 1rem",
            marginRight: "0.75rem",
            borderRadius: "20px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onClick={() => setActiveView("form")}
          aria-label="Submit Ticket"
        >
          Submit Ticket
        </button>
        <button
          style={{
            background: activeView === "status" ? THEME.accent : "transparent",
            border: "none",
            color: "#fff",
            fontSize: "1rem",
            padding: "0.5rem 1rem",
            marginRight: "0.75rem",
            borderRadius: "20px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onClick={() => setActiveView("status")}
          aria-label="View Ticket Status"
        >
          Ticket Status
        </button>
        <button
          style={{
            background: activeView === "dashboard" ? THEME.accent : "transparent",
            border: "none",
            color: "#fff",
            fontSize: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onClick={() => setActiveView("dashboard")}
          aria-label="Dashboard"
        >
          Dashboard
        </button>
      </nav>
    </header>
  );
}

// PUBLIC_INTERFACE
function TicketForm({ onSuccess }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  // PUBLIC_INTERFACE
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessData(null);
    try {
      const resp = await fetch(`${API_BASE}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description }),
      });
      if (resp.status === 201) {
        const data = await resp.json();
        setSuccessData(data);
        setSubject("");
        setDescription("");
        if (onSuccess) onSuccess();
      } else {
        const err = await resp.json();
        setError(
          err && err.detail
            ? err.detail.map((v) => v.msg).join(", ")
            : "Error submitting ticket."
        );
      }
    } catch (e) {
      setError("Error submitting ticket.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="form-section" style={sectionBoxStyle}>
      <h2 style={sectionTitleStyle}>Submit a Support Ticket</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "auto" }}>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>
            Subject
            <input
              type="text"
              maxLength={100}
              style={inputStyle}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Brief summary"
            />
          </label>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>
            Description
            <textarea
              style={{ ...inputStyle, minHeight: 80 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Detailed description"
            />
          </label>
        </div>
        <button
          type="submit"
          style={{
            ...buttonStyle,
            background: THEME.primary,
            color: "#fff",
            minWidth: 120,
          }}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
      {error && (
        <div style={{ color: "#d32f2f", padding: "10px" }}>{error}</div>
      )}
      {successData && (
        <div
          style={{
            color: THEME.primary,
            padding: "10px",
            marginTop: "8px",
            fontWeight: "bold",
          }}
        >
          Ticket submitted! Your Ticket ID: {successData.id}
        </div>
      )}
    </section>
  );
}

// PUBLIC_INTERFACE
function TicketStatusViewer() {
  const [ticketId, setTicketId] = useState("");
  const [statusData, setStatusData] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  // PUBLIC_INTERFACE
  async function fetchStatus(e) {
    e.preventDefault();
    setFetching(true);
    setError("");
    setStatusData(null);
    try {
      const resp = await fetch(`${API_BASE}/tickets/${ticketId}`);
      if (resp.status === 200) {
        const data = await resp.json();
        setStatusData(data);
      } else {
        setError("Ticket not found.");
      }
    } catch (e) {
      setError("Failed to fetch ticket.");
    } finally {
      setFetching(false);
    }
  }

  return (
    <section className="status-section" style={sectionBoxStyle}>
      <h2 style={sectionTitleStyle}>Check Ticket Status</h2>
      <form onSubmit={fetchStatus} style={{ maxWidth: 370, margin: "auto" }}>
        <div style={{ marginBottom: 15 }}>
          <label style={labelStyle}>
            Ticket ID
            <input
              type="number"
              style={inputStyle}
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              min={1}
              required
              placeholder="Enter the Ticket ID"
            />
          </label>
        </div>
        <button
          type="submit"
          style={{
            ...buttonStyle,
            background: THEME.primary,
            color: "#fff",
          }}
          disabled={fetching || !ticketId}
        >
          {fetching ? "Checking..." : "Check Status"}
        </button>
      </form>
      {error && (
        <div style={{ color: "#d32f2f", padding: "10px" }}>{error}</div>
      )}
      {statusData && (
        <div
          style={{
            background: "#e3f2fd",
            color: THEME.primary,
            border: `1px solid ${THEME.primary}`,
            margin: "18px auto",
            padding: "16px",
            borderRadius: 12,
            maxWidth: 390,
          }}
        >
          <div>
            <strong>ID:</strong> {statusData.id}
          </div>
          <div>
            <strong>Subject:</strong> {statusData.subject}
          </div>
          <div>
            <strong>Description:</strong> {statusData.description}
          </div>
          <div>
            <strong>Status:</strong> {statusData.status}
          </div>
        </div>
      )}
    </section>
  );
}

// PUBLIC_INTERFACE
function TicketDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // PUBLIC_INTERFACE
  async function fetchTickets() {
    setLoading(true);
    setErr("");
    try {
      const resp = await fetch(`${API_BASE}/tickets`);
      if (resp.status === 200) {
        const data = await resp.json();
        setTickets(data);
      } else {
        setErr("Failed to retrieve tickets.");
      }
    } catch (e) {
      setErr("Failed to retrieve tickets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <section className="dashboard-section" style={sectionBoxStyle}>
      <h2 style={sectionTitleStyle}>Ticket Dashboard</h2>
      {loading && (
        <div style={{ color: THEME.secondary, fontWeight: "bold" }}>Loading...</div>
      )}
      {err && <div style={{ color: "#d32f2f", padding: "10px" }}>{err}</div>}
      {!loading && !err && tickets.length === 0 && (
        <div style={{ color: THEME.secondary }}>No tickets available.</div>
      )}
      {!loading && tickets.length > 0 && (
        <div className="ticket-table-wrapper" style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              maxWidth: 800,
              borderCollapse: "collapse",
              margin: "auto",
              marginTop: 10,
              background: "#fff",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: THEME.primary, color: "#fff" }}>
                <th style={thTdStyle}>ID</th>
                <th style={thTdStyle}>Subject</th>
                <th style={thTdStyle}>Description</th>
                <th style={thTdStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td style={thTdStyle}>{t.id}</td>
                  <td style={thTdStyle}>{t.subject}</td>
                  <td style={thTdStyle}>{t.description.slice(0, 80) + (t.description.length > 80 ? "…" : "")}</td>
                  <td style={{ ...thTdStyle, color: THEME.primary, fontWeight: 500 }}>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/**
 * Minimal, responsive Footer for contact/info
 */
function Footer() {
  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "1.2rem 0",
        background: THEME.secondary,
        color: "#fff",
        textAlign: "center",
        fontSize: "1rem",
        letterSpacing: "1px",
      }}
    >
      Need help? <a href="mailto:support@example.com" style={{ color: THEME.accent }}>Contact us</a>
      <span style={{ marginLeft: 10 }}>&copy; {new Date().getFullYear()} Ticket System</span>
    </footer>
  );
}

/** General layout and App logic **/
function App() {
  const [theme, setTheme] = useState("light");
  const [activeView, setActiveView] = useState("form");

  // Set theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // For dashboard refresh after new submit
  const [dashboardRefresh, setDashboardRefresh] = useState(0);

  return (
    <div className="App" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header activeView={activeView} setActiveView={setActiveView} />
      <button
        className="theme-toggle"
        style={{
          position: "absolute",
          top: 22,
          right: 14,
        }}
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
      <main
        style={{
          flex: 1,
          padding: "2rem 1rem",
          background: "var(--bg-primary)",
          transition: "background 0.3s",
        }}
      >
        {activeView === "form" && (
          <TicketForm
            onSuccess={() => {
              // Refresh dashboard if open later
              setDashboardRefresh((c) => c + 1);
            }}
          />
        )}
        {activeView === "status" && <TicketStatusViewer />}
        {activeView === "dashboard" && <TicketDashboard key={dashboardRefresh} />}
      </main>
      <Footer />
    </div>
  );
}

/** --- Inline minimal styles for layout and controls --- **/
const sectionBoxStyle = {
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 2px 24px 0 rgba(33,46,93,.09)",
  padding: "2rem 2.5rem",
  margin: "0 auto 2rem auto",
  maxWidth: 650,
  width: "100%",
  border: `1px solid ${THEME.primary}10`,
};

const sectionTitleStyle = {
  color: THEME.primary,
  marginBottom: 22,
  marginLeft: 0,
  fontWeight: 700,
  letterSpacing: "0.5px",
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  fontSize: "1rem",
  color: THEME.secondary,
  marginBottom: 4,
  fontWeight: 600,
};

const inputStyle = {
  marginTop: 8,
  padding: "0.7rem 1rem",
  border: `1.5px solid ${THEME.primary}50`,
  borderRadius: 8,
  fontSize: "1rem",
  width: "100%",
  outline: "none",
  marginBottom: 2,
  background: "#f8f9fa",
};

const buttonStyle = {
  border: "none",
  borderRadius: 25,
  padding: "0.7rem 2.2rem",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
  marginTop: 6,
  letterSpacing: "0.05em",
  boxShadow: "0 1px 4px #2a33500d",
};

const thTdStyle = {
  border: "1px solid #e9ecef",
  padding: "0.7rem 1.1rem",
  textAlign: "left",
  fontSize: "0.97rem",
};

// PUBLIC_INTERFACE
export default App;
