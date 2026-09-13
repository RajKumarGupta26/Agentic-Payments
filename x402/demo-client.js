require("dotenv").config();

const {
    x402Client,
    x402HTTPClient,
} = require("@x402/core/client");

const {
    registerExactEvmScheme,
} = require("@x402/evm/exact/client");

const {
    wrapFetchWithPayment,
} = require("@x402/fetch");

const {
    privateKeyToAccount,
} = require("viem/accounts");

const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;

if (!PRIVATE_KEY) {
    throw new Error("AGENT_PRIVATE_KEY is missing");
}

if (!PRIVATE_KEY.startsWith("0x")) {
    throw new Error("AGENT_PRIVATE_KEY must start with 0x");
}

const account = privateKeyToAccount(PRIVATE_KEY);

console.log("AI Agent:", account.address);

//
// 1. Create the core x402 client
//
const client = new x402Client();

//
// 2. Register EVM exact payment scheme
//
registerExactEvmScheme(client, {
    signer: account,
    networks: ["eip155:84532"],
});

//
// 3. IMPORTANT:
//    Create the HTTP client around x402Client
//
const httpClient = new x402HTTPClient(client);

//
// 4. Wrap normal fetch with x402 payment handling
//
const fetchWithPayment = wrapFetchWithPayment(
    fetch,
    httpClient
);

async function main() {
    const url = "http://localhost:4000/service/weather";

    console.log("");
    console.log("========================================");
    console.log("       X402 AGENT PAYMENT DEMO");
    console.log("========================================");
    console.log("");

    console.log("Agent:", account.address);
    console.log("Network: Base Sepolia");
    console.log("Service: Premium Weather Data");
    console.log("Price: 0.01 USDC");
    console.log("URL:", url);

    console.log("");
    console.log("Requesting premium weather...");
    console.log("If server returns HTTP 402, x402 will");
    console.log("automatically sign the payment and retry.");
    console.log("");

    const response = await fetchWithPayment(url);

    console.log("HTTP Status:", response.status);

    const text = await response.text();

    console.log("");
    console.log("Response:");
    console.log(text);

    if (response.status !== 200) {
        console.log("");
        console.log("========================================");
        console.log("       X402 PAYMENT FAILED");
        console.log("========================================");
        console.log("");
        console.log("The server did not return HTTP 200.");
        console.log("");
        return;
    }

    console.log("");
    console.log("========================================");
    console.log("       X402 PAYMENT SUCCESSFUL");
    console.log("========================================");
    console.log("");

    const settlementHeader =
        response.headers.get("PAYMENT-RESPONSE");

    if (settlementHeader) {
        console.log("Settlement response received.");
        console.log("PAYMENT-RESPONSE header:");
        console.log(settlementHeader);
    } else {
        console.log(
            "No PAYMENT-RESPONSE header returned."
        );
    }

    console.log("");
    console.log("Premium service delivered successfully.");
}

main().catch((error) => {
    console.error("");
    console.error("========================================");
    console.error("       X402 PAYMENT FAILED");
    console.error("========================================");
    console.error("");

    console.error(error);

    process.exitCode = 1;
});