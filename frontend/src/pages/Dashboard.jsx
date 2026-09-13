import BudgetCard from "../components/BudgetCard";
import SpendProgress from "../components/SpendProgress";
import PaymentTable from "../components/PaymentTable";
import DeliveryStatus from "../components/DeliveryStatus";
import SecurityEvents from "../components/SecurityEvents";
import ProviderCards from "../components/ProviderCards";

export default function Dashboard({
  budget,
  payments,
  events,
  providers,
  loading,
  onRefresh,
  onDemoOverspend
}) {
  return (
    <main className="dashboard">
      <div className="hero-row">
        <div>
          <p className="eyebrow">OWNER CONSOLE / AGENTPAY</p>
          <h1>Autonomous payments, <span>enforced.</span></h1>
          <p className="hero-copy">
            Monitor agent spending, payment outcomes and delivery proofs from one place.
          </p>
        </div>

        <div className="hero-actions">
          <button className="secondary" onClick={onRefresh} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="danger-btn" onClick={onDemoOverspend}>
            Test overspend
          </button>
        </div>
      </div>

      <div className="grid-top">
        <BudgetCard budget={budget} />
        <SpendProgress budget={budget} />
        <DeliveryStatus payments={payments} />
      </div>

      <div className="grid-main">
        <PaymentTable payments={payments} />
        <SecurityEvents events={events} />
      </div>

      <ProviderCards providers={providers} />
    </main>
  );
}
