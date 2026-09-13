export default function PaymentTable({ payments }) {
  return (
    <section className="card table-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PURCHASE HISTORY</p>
          <h2>Recent payments</h2>
        </div>
        <span className="count">{payments.length}</span>
      </div>

      {payments.length === 0 ? (
        <div className="empty">No payments recorded yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Delivery</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td><strong>{payment.provider}</strong></td>
                  <td>{payment.service}</td>
                  <td>{payment.amount} {payment.currency}</td>
                  <td><span className={`badge ${payment.status}`}>{payment.status}</span></td>
                  <td><span className={`badge ${payment.delivery_status}`}>{payment.delivery_status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
