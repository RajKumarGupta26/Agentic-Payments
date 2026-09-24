require("dotenv").config({ path: "../.env" });

const { wrapFetchWithPayment, x402Client } = require("@x402/fetch");
const { ExactEvmScheme } = require("@x402/evm/exact/client");
const { privateKeyToAccount } = require("viem/accounts");

const PROVIDER_URL =
    process.env.PROVIDER_URL ||
    "https://gangly-dictation-effective.ngrok-free.dev";

async function main() {
    const privateKey = process.env.AGENT_PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("AGENT_PRIVATE_KEY not found in ../.env");
    }

    if (!privateKey.startsWith("0x")) {
        throw new Error("AGENT_PRIVATE_KEY must start with 0x");
    }

    const account = privateKeyToAccount(privateKey);

    console.log("Agent:", account.address);

    const schemeClient = new ExactEvmScheme(account);

    const client = x402Client.fromConfig({
        schemes: [
            {
                network: "eip155:84532",
                client: schemeClient,
            },
        ],
    });

    const paidFetch = wrapFetchWithPayment(fetch, client);

    const serviceId = process.argv[2] || "weather";

    console.log(`Requesting ${serviceId} service...`);

    const response = await paidFetch(
        `${PROVIDER_URL}/service/${serviceId}`
    );

    console.log("HTTP status:", response.status);

    const paymentResponse =
        response.headers.get("PAYMENT-RESPONSE");

    if (paymentResponse) {
        try {
            const decodedPayment = JSON.parse(
                Buffer.from(paymentResponse, "base64").toString("utf8")
            );

            console.log("Payment response:");
            console.log(JSON.stringify(decodedPayment, null, 2));

            if (decodedPayment.transaction) {
                console.log(
                    "Payment transaction:",
                    decodedPayment.transaction
                );
            }
        } catch (error) {
            console.log(
                "PAYMENT-RESPONSE received but could not be decoded."
            );
            console.log(paymentResponse);
        }
    } else {
        console.log("No PAYMENT-RESPONSE header returned.");
    }

    const text = await response.text();

    console.log("Provider response:");
    console.log(text);

    if (response.status !== 200) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error("\nERROR:");
    console.error(error);
    process.exitCode = 1;
});