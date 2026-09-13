export default function DeliveryStatus({ payments }) {
  const verified = payments.filter((p) => p.delivery_status === "verified").length;

  return (
    <section className="card small-card">
      <p className="eyebrow">DELIVERY PROOF</p>
      <div className="metric">{verified} <span>verified</span></div>
      <p className="muted">Services with delivery confirmation recorded.</p>
    </section>
  );
}
