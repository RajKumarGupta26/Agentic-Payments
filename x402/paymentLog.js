const payments = [];

function recordPayment(payment) {
    const record = {
        id: payments.length + 1,
        nonce: payment.nonce || null,
        service: payment.service || null,
        amount: payment.amount || null,
        currency: payment.currency || "USDC",
        network: payment.network || "eip155:84532",
        status: payment.status || "pending",
        txHash: payment.txHash || null,
        payer: payment.payer || null,
        timestamp: new Date().toISOString()
    };

    payments.push(record);

    return record;
}

function getPayments() {
    return payments;
}

function getPaymentByNonce(nonce) {
    return payments.find(
        (payment) => payment.nonce === nonce
    ) || null;
}

module.exports = {
    recordPayment,
    getPayments,
    getPaymentByNonce
};
