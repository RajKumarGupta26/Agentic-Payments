export default function ProviderCards({ providers }) {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MARKETPLACE</p>
          <h2>Independent providers</h2>
        </div>
      </div>

      <div className="provider-grid">
        {providers.map((provider) => (
          <div className="provider" key={provider.id}>
            <div className="provider-top">
              <strong>{provider.name}</strong>
              <span className="online-dot">● {provider.status}</span>
            </div>
            <p>{provider.service}</p>
            <div className="provider-meta">
              <span>{provider.price} ETH</span>
              <span>Quality {provider.quality}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
