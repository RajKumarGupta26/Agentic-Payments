const express = require("express");

const app = express();
const PORT = 4000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Agentic Payments Provider is running!",
        provider: "P3",
        status: "online"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        provider: "P3 x402 Provider"
    });
});

app.get("/api/services", (req, res) => {
    res.json({
        provider: "P3 x402 Provider",
        services: [
            {
                id: "weather",
                name: "Premium Weather Data",
                description: "Get premium weather information",
                price: "0.01",
                currency: "USDC",
                endpoint: "/api/weather"
            },
            {
                id: "analytics",
                name: "Premium Analytics",
                description: "Get premium analytics data",
                price: "0.02",
                currency: "USDC",
                endpoint: "/api/analytics"
            }
        ]
    });
});

app.get("/api/weather", (req, res) => {

    const payment = req.headers["x-payment"];

    if (!payment) {
        return res.status(402).json({
            error: "Payment Required",
            message: "Payment is required to access Premium Weather Data",
            price: "0.01",
            currency: "USDC"
        });
    }

    res.json({
        service: "Premium Weather Data",
        location: "Gurugram",
        temperature: 29,
        unit: "C",
        condition: "Clear",
        provider: "P3 x402 Provider",
        payment: "accepted"
    });
});

app.listen(PORT, () => {
    console.log(`P3 Provider running at http://localhost:${PORT}`);
});