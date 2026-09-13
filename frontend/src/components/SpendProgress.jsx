export default function SpendProgress({ budget }) {
  const remaining = budget?.remaining ?? 0;

  return (
    <section className="card small-card">
      <p className="eyebrow">REMAINING</p>
      <div className="metric">{remaining.toFixed(3)} <span>ETH</span></div>
      <p className="muted">Available spending allowance</p>
    </section>
  );
}
