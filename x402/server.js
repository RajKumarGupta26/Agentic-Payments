require("dotenv").config();

const express = require("express");

const {
    paymentMiddleware,
} = require("@x402/express");

const {
    x402ResourceServer,
    HTTPFacilitatorClient,
} = require("@x402/core/server");

const {
    ExactEvmScheme,
} = require("@x402/evm/exact/server");

const {
    recordPayment,
    getPayments,
    getPaymentByNonce,
} = require("./paymentLog");

const app = express();

const PORT = process.env.PORT || 4000;
const NETWORK = process.env.NETWORK || "eip155:84532";
const PROVIDER_ADDRESS = process.env.PROVIDER_ADDRESS;
const FACILITATOR_URL =
    process.env.FACILITATOR_URL ||
    "https://x402.org/facilitator";

app.use(express.json());


// ========================================
// BASIC PROVIDER INFO
// ========================================

app.get("/", (req, res) => {
    res.json({
        message: "Agentic Payments Provider is running!",
        provider: "P3 x402 Provider",
        status: "online",
        network: "Base Sepolia",
        currency: "USDC"
    });
});


// ========================================
// HEALTH
// ========================================

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        provider: "P3 x402 Provider",
        network: "Base Sepolia",
        environment: "testnet"
    });
});


// ========================================
// SERVICE CATALOG
// ========================================

app.get("/api/services", (req, res) => {
    res.json({
        provider: "P3 x402 Provider",
        network: "Base Sepolia",
        currency: "USDC",

        services: [
            {
                id: "weather",
                name: "Premium Weather Data",
                description: "Get premium weather information",
                price: "0.01",
                currency: "USDC",
                endpoint: "/service/weather"
            },
            {
                id: "analytics",
                name: "Premium Analytics",
                description: "Get premium analytics data",
                price: "0.02",
                currency: "USDC",
                endpoint: "/service/analytics"
            }
        ]
    });
});


// ========================================
// PAYMENT LOG API
// ========================================

app.get("/api/payments", (req, res) => {
    res.json({
        provider: "P3 x402 Provider",
        network: NETWORK,
        currency: "USDC",
        payments: getPayments()
    });
});


// ========================================
// PAYMENT STATUS API
// ========================================

app.get("/status/:nonce", (req, res) => {

    const nonce = req.params.nonce;

    const payment = getPaymentByNonce(nonce);

    if (!payment) {
        return res.status(404).json({
            nonce,
            status: "not_found"
        });
    }

    res.json({
        nonce: payment.nonce,
        status: payment.status,
        txHash: payment.txHash,
        payer: payment.payer,
        service: payment.service,
        amount: payment.amount,
        currency: payment.currency,
        timestamp: payment.timestamp
    });
});


// ========================================
// x402 PAYMENT MIDDLEWARE
// ========================================

if (PROVIDER_ADDRESS) {

    const facilitator = new HTTPFacilitatorClient({
    	url: "https://x402.org/facilitator"
    });

    const resourceServer = new x402ResourceServer(facilitator);

    resourceServer.register(
        NETWORK,
        new ExactEvmScheme()
    );

    app.use(
        paymentMiddleware(
            {
                "GET /service/weather": {
                    accepts: [
                        {
                            scheme: "exact",
                            price: "$0.01",
                            network: NETWORK,
                            payTo: PROVIDER_ADDRESS
                        }
                    ],
                    description: "Premium Weather Data",
                    mimeType: "application/json"
                },

                "GET /service/analytics": {
                    accepts: [
                        {
                            scheme: "exact",
                            price: "$0.02",
                            network: NETWORK,
                            payTo: PROVIDER_ADDRESS
                        }
                    ],
                    description: "Premium Analytics Data",
                    mimeType: "application/json"
                }
            },
            resourceServer
        )
    );

    console.log("x402 payment middleware enabled.");

} else {

    console.log(
        "WARNING: PROVIDER_ADDRESS is empty."
    );

    console.log(
        "Real x402 payment protection is waiting for provider wallet."
    );
}


// ========================================
// WEATHER SERVICE
// ========================================

app.get("/service/weather", (req, res) => {

    res.status(200).json({
        service: "Premium Weather Data",
        service_id: "weather",

        data: {
            location: "Gurugram",
            temperature: 29,
            unit: "C",
            condition: "Clear"
        },

        provider: "P3 x402 Provider"
    });
});


// ========================================
// ANALYTICS SERVICE
// ========================================

app.get("/service/analytics", (req, res) => {

    res.status(200).json({
        service: "Premium Analytics",
        service_id: "analytics",

        data: {
            users: 1250,
            transactions: 438,
            successRate: 98.7
        },

        provider: "P3 x402 Provider"
    });
});


// ========================================
// SERVER
// ========================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `P3 Provider running at http://localhost:${PORT}`
    );
});