function iconFor(severity) {
  if (severity === "danger") return "!";
  if (severity === "success") return "✓";
  if (severity === "warning") return "⚠";
  return "i";
}

export default function SecurityEvents({ events }) {
  return (
    <section className="card events-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">SECURITY & AUDIT</p>
          <h2>Security events</h2>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty">No security events yet.</div>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <div className="event" key={event.id}>
              <div className={`event-icon ${event.severity}`}>{iconFor(event.severity)}</div>
              <div className="event-main">
                <strong>{event.type.replaceAll("_", " ")}</strong>
                <span>{event.message}</span>
              </div>
              <time>{new Date(event.timestamp).toLocaleTimeString()}</time>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
