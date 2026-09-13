export default function BudgetCard({ budget }) {
  const percent = budget?.budget
    ? Math.min((budget.spent / budget.budget) * 100, 100)
    : 0;

  return (
    <section className="card budget-card">
      <div className="card-title-row">
        <div>
          <p className="eyebrow">AGENT BUDGET</p>
          <h2>{(budget?.spent ?? 0).toFixed(3)} / {(budget?.budget ?? 0).toFixed(3)} ETH</h2>
        </div>
        <span className="status-pill safe">ENFORCED</span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="budget-footer">
        <span>Spent {percent.toFixed(0)}%</span>
        <strong>{(budget?.remaining ?? 0).toFixed(3)} ETH remaining</strong>
      </div>

      <p className="muted">
        Spending authority is intended to be enforced by BudgetVault, not by the agent prompt.
      </p>
    </section>
  );
}
