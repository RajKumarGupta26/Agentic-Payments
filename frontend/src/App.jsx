import { useEffect, useState } from "react";
import "./App.css";

const API = "http://127.0.0.1:8001";

function App() {
  const [budget, setBudget] = useState(null);
  const [payments, setPayments] = useState([]);
  const [providers, setProviders] = useState([]);
  const [agentResult, setAgentResult] = useState(null);
  const [selectedService, setSelectedService] = useState("weather");
  const [executing, setExecuting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    try {
      const [budgetRes, paymentsRes, providersRes, resultRes] =
        await Promise.all([
          fetch(`${API}/api/budget`),
          fetch(`${API}/api/payments`),
          fetch(`${API}/api/providers`),
          fetch(`${API}/api/agent/result`),
        ]);

      const budgetData = await budgetRes.json();
      const paymentData = await paymentsRes.json();
      const providerData = await providersRes.json();
      const resultData = await resultRes.json();

      setBudget(budgetData);
      setPayments(paymentData.payments || []);
      setProviders(providerData.providers || []);
      setAgentResult(resultData.result);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(loadDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  async function executeAgent() {
    if (executing) return;

    setExecuting(true);
    setMessage("Agent is processing the payment...");

    try {
      const amount = selectedService === "weather" ? 0.01 : 0.02;

      const response = await fetch(`${API}/api/agent/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: selectedService,
          provider: "P3 x402 Provider",
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Execution failed");
      }

      setAgentResult(data.result);
      setMessage("Payment confirmed · service delivered");
      await loadDashboard();
    } catch (error) {
      setMessage(`Execution failed · ${error.message}`);
    } finally {
      setExecuting(false);
    }
  }

  const remaining = budget?.remaining ?? 0;
  const spendingLimit = budget?.spending_limit ?? 10;
  const spent = budget?.spent ?? 0;
  const percentage =
    spendingLimit > 0 ? Math.min((spent / spendingLimit) * 100, 100) : 0;

  const selectedProvider =
    providers.find((p) => p.id === selectedService) || {
      name: "P3 x402 Provider",
      service:
        selectedService === "weather"
          ? "Premium Weather Data"
          : "Premium Analytics",
      price: selectedService === "weather" ? 0.01 : 0.02,
      currency: "USDC",
      network: "Base Sepolia",
      status: "online",
    };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="brand">
            <span className="brand-mark">A</span>
            AGENTPAY
          </div>
          <div className="subtitle">
            Autonomous payment infrastructure
          </div>
        </div>

        <div className="network-status">
          <span className="online-dot" />
          <span>System Online</span>
          <span className="divider" />
          <span>Base Sepolia</span>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">AGENT CONTROL CENTER</p>
            <h1>Spend intelligently.<br />Verify everything.</h1>
            <p className="hero-copy">
              An autonomous payment layer where AI agents discover services,
              authorize payments and prove delivery.
            </p>
          </div>

          <div className="hero-badge">
            <span>CHAIN</span>
            <strong>84532</strong>
            <small>Base Sepolia</small>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card featured">
            <div className="stat-label">AVAILABLE BUDGET</div>
            <div className="stat-value">
              ${remaining.toFixed(2)}
              <span>USDC</span>
            </div>
            <div className="stat-meta">
              of ${spendingLimit.toFixed(2)} spending limit
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">ON-CHAIN SPENT</div>
            <div className="stat-value">
              ${spent.toFixed(2)}
              <span>USDC</span>
            </div>
            <div className="stat-meta">Verified by P1 contract</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">PAYMENTS</div>
            <div className="stat-value">{payments.length}</div>
            <div className="stat-meta">Recorded transactions</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">AGENT STATUS</div>
            <div className="agent-status">
              <span className="pulse" />
              AUTHORIZED
            </div>
            <div className="stat-meta">Spending controls active</div>
          </div>
        </section>

        <section className="budget-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SPENDING CONTROL</p>
              <h2>Agent budget</h2>
            </div>
            <span className="percentage">{percentage.toFixed(0)}% used</span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="budget-row">
            <span>${spent.toFixed(2)} spent</span>
            <span>${remaining.toFixed(2)} remaining</span>
          </div>
        </section>

        <section className="execute-card">
          <div className="execute-left">
            <p className="eyebrow">AUTONOMOUS EXECUTION</p>
            <h2>Execute agent payment</h2>
            <p>
              Let the AI agent request a paid service through the x402
              protocol.
            </p>

            <div className="service-selector">
              <button
                className={selectedService === "weather" ? "selected" : ""}
                onClick={() => setSelectedService("weather")}
              >
                <span className="service-icon">☼</span>
                <span>
                  <strong>Premium Weather</strong>
                  <small>0.01 USDC</small>
                </span>
              </button>

              <button
                className={selectedService === "analytics" ? "selected" : ""}
                onClick={() => setSelectedService("analytics")}
              >
                <span className="service-icon">◫</span>
                <span>
                  <strong>Premium Analytics</strong>
                  <small>0.02 USDC</small>
                </span>
              </button>
            </div>

            <button
              className="execute-button"
              onClick={executeAgent}
              disabled={executing}
            >
              {executing ? "PROCESSING..." : "⚡ EXECUTE AGENT PAYMENT"}
            </button>

            {message && <div className="execution-message">{message}</div>}
          </div>

          <div className="execute-right">
            <div className="provider-mini">
              <span className="provider-dot" />
              PROVIDER ONLINE
            </div>

            <h3>{selectedProvider.service}</h3>

            <div className="mini-details">
              <div>
                <span>PRICE</span>
                <strong>
                  ${selectedProvider.price.toFixed(2)} USDC
                </strong>
              </div>
              <div>
                <span>NETWORK</span>
                <strong>Base Sepolia</strong>
              </div>
              <div>
                <span>PROTOCOL</span>
                <strong>x402</strong>
              </div>
            </div>
          </div>
        </section>

        <div className="two-column">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">LATEST ACTIVITY</p>
                <h2>Agent activity</h2>
              </div>
              <span className="live-tag">LIVE</span>
            </div>

            {agentResult ? (
              <div className="activity">
                <div className="activity-icon">✓</div>
                <div className="activity-main">
                  <strong>
                    {agentResult.service || "Premium Service"}
                  </strong>
                  <span>
                    Payment confirmed · delivery received
                  </span>
                  <small>
                    Request {agentResult.request_id}
                  </small>
                </div>
                <div className="activity-amount">
                  ${agentResult.payment?.amount?.toFixed(2) || "0.01"}
                  <small>USDC</small>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                No agent activity yet.
              </div>
            )}
          </section>

          <section className="panel proof-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">DELIVERY VERIFICATION</p>
                <h2>Proof of delivery</h2>
              </div>
              <span className="verified-tag">VERIFIED</span>
            </div>

            {agentResult?.delivery_proof ? (
              <>
                <div className="proof-status">
                  <span>✓</span>
                  <div>
                    <strong>SHA-256 verified</strong>
                    <small>Service content integrity confirmed</small>
                  </div>
                </div>

                <div className="hash-box">
                  <span>CONTENT HASH</span>
                  <code>
                    {agentResult.delivery_proof.content_hash}
                  </code>
                </div>
              </>
            ) : (
              <div className="empty-state">
                Waiting for delivery proof.
              </div>
            )}
          </section>
        </div>

        <section className="panel payment-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">AUDIT TRAIL</p>
              <h2>Payment history</h2>
            </div>
            <span className="count-tag">
              {payments.length} RECORDS
            </span>
          </div>

          {payments.length > 0 ? (
            <div className="payment-list">
              {payments.slice(0, 6).map((payment, index) => (
                <div className="payment-row" key={index}>
                  <div className="payment-check">✓</div>
                  <div className="payment-service">
                    <strong>{payment.service || "Agent Payment"}</strong>
                    <span>{payment.provider || "P3 x402 Provider"}</span>
                  </div>
                  <div className="payment-network">
                    <span>NETWORK</span>
                    Base Sepolia
                  </div>
                  <div className="payment-value">
                    {payment.amount ?? "—"} USDC
                  </div>
                  <div className="confirmed">CONFIRMED</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Execute an agent payment to populate the audit trail.
            </div>
          )}
        </section>

        <section className="providers-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SERVICE MARKET</p>
              <h2>Available providers</h2>
            </div>
          </div>

          <div className="provider-grid">
            {providers.map((provider) => (
              <div className="provider-card" key={provider.id}>
                <div className="provider-top">
                  <span className="provider-symbol">
                    {provider.id === "weather" ? "☼" : "◫"}
                  </span>
                  <span className="online-label">
                    ● ONLINE
                  </span>
                </div>

                <h3>{provider.service}</h3>
                <p>{provider.name}</p>

                <div className="provider-bottom">
                  <strong>
                    ${provider.price.toFixed(2)}
                    <small> USDC</small>
                  </strong>
                  <span>{provider.network}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <span>AGENTPAY © 2026</span>
        <span>AI × WEB3 × AUTONOMOUS PAYMENTS</span>
      </footer>
    </div>
  );
}

export default App;