require("dotenv").config();

const {
    x402Client,
    x402HTTPClient,
} = require("@x402/core/client");

const {
    registerExactEvmScheme,
} = require("@x402/evm/exact/client");

const {
    privateKeyToAccount,
} = require("viem/accounts");

async function main() {
    const account = privateKeyToAccount(
        process.env.AGENT_PRIVATE_KEY
    );

    console.log("Agent:", account.address);

    const client = new x402Client();

    registerExactEvmScheme(client, {
        signer: account,
        networks: ["eip155:84532"],
    });

    const response = await fetch(
        "http://localhost:4000/service/weather"
    );

    console.log("Status:", response.status);

    const paymentRequiredHeader =
        response.headers.get("PAYMENT-REQUIRED");

    if (!paymentRequiredHeader) {
        throw new Error(
            "Server did not return PAYMENT-REQUIRED"
        );
    }

    const httpClient =
        new x402HTTPClient(client);

    const paymentRequired =
        httpClient.getPaymentRequiredResponse(
            (name) => response.headers.get(name)
        );

    console.log("");
    console.log("PAYMENT REQUIREMENT");
    console.log(
        JSON.stringify(paymentRequired, null, 2)
    );

    console.log("");
    console.log("Creating payment payload...");

    const payload =
        await client.createPaymentPayload(
            paymentRequired
        );

    console.log("");
    console.log("PAYMENT PAYLOAD");
    console.log(
        JSON.stringify(payload, null, 2)
    );

    const headers =
        httpClient.encodePaymentSignatureHeader(
            payload
        );

    console.log("");
    console.log("PAYMENT HEADER");
    console.log(
        JSON.stringify(headers, null, 2)
    );

    console.log("");
    console.log("DIAGNOSTIC COMPLETE");
    console.log("No payment was submitted.");
}

main().catch((error) => {
    console.error("");
    console.error("===== REAL X402 ERROR =====");
    console.error(error);
    console.error("===========================");
});