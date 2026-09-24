import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const [wallet] = await ethers.getSigners();

  const paymentContractAddress =
    "0x8a7648aA1bC324f940F0f5652D44f09927cA2Adf";

  const usdcAddress =
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  const merchantAddress =
    "0x000000000000000000000000000000000000dEaD";

  const usdc = await ethers.getContractAt(
    [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address,uint256) returns (bool)",
      "function allowance(address,address) view returns (uint256)"
    ],
    usdcAddress
  );

  const paymentContract = await ethers.getContractAt(
    [
      "function registerAgent(address,uint256)",
      "function agents(address) view returns (bool,uint256,uint256)",
      "function makePayment(address,uint256)"
    ],
    paymentContractAddress
  );

  console.log("========================================");
  console.log("P1 REAL BASE SEPOLIA PAYMENT TEST");
  console.log("========================================");

  console.log("Agent wallet:", wallet.address);
  console.log("Merchant:", merchantAddress);

  // 1 USDC = 1,000,000 units
  const spendingLimit = 10_000_000n;
  const paymentAmount = 1_000_000n;

  console.log("\n1. Registering agent...");

  const registerTx = await paymentContract.registerAgent(
    wallet.address,
    spendingLimit
  );

  await registerTx.wait();

  console.log("Agent registered.");

  // Check registration
  const agentData =
    await paymentContract.agents(wallet.address);

  console.log("Authorized:", agentData[0]);
  console.log(
    "Spending limit:",
    ethers.formatUnits(agentData[1], 6),
    "USDC"
  );

  console.log("\n2. Approving USDC...");

  const approveTx = await usdc.approve(
    paymentContractAddress,
    paymentAmount
  );

  await approveTx.wait();

  console.log("USDC approved.");

  console.log("\n3. Making 1 USDC payment...");

  const paymentTx =
    await paymentContract.makePayment(
      merchantAddress,
      paymentAmount
    );

  const receipt = await paymentTx.wait();

  console.log("Payment successful!");

  console.log("Transaction hash:", receipt?.hash);

  // Check final state
  const finalAgentData =
    await paymentContract.agents(wallet.address);

  const remainingBalance =
    await usdc.balanceOf(wallet.address);

  console.log("\n4. Final state");

  console.log(
    "Total spent:",
    ethers.formatUnits(
      finalAgentData[2],
      6
    ),
    "USDC"
  );

  console.log(
    "Agent USDC balance:",
    ethers.formatUnits(
      remainingBalance,
      6
    ),
    "USDC"
  );

  console.log("\n========================================");
  console.log("REAL PAYMENT TEST COMPLETE");
  console.log("========================================");
}

main().catch((error) => {
  console.error("\nPayment test failed:");
  console.error(error);
  process.exitCode = 1;
});