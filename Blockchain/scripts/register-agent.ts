import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const [owner] = await ethers.getSigners();

  const contractAddress =
    "0x83f624259c83dD597560A2A7469B94da99Ccd477";

  const agentAddress =
    "0x60fbC30EF662f3813Ce6F9c9e2c0489ada4c6D53";

  const spendingLimit = 10_000_000n; // 10 USDC

  const AgenticPayments =
    await ethers.getContractFactory("AgenticPayments");

  const contract =
    AgenticPayments.attach(contractAddress);

  console.log("=================================");
  console.log("Registering AI Agent");
  console.log("=================================");
  console.log("Owner:", owner.address);
  console.log("Agent:", agentAddress);
  console.log("Spending limit:", spendingLimit.toString());
  console.log("Contract:", contractAddress);

  console.log("\nRegistering agent...");

  const tx = await contract.registerAgent(
    agentAddress,
    spendingLimit
  );

  console.log("Transaction:", tx.hash);

  await tx.wait();

  console.log("\n=================================");
  console.log("AGENT REGISTERED SUCCESSFULLY");
  console.log("=================================");

  const agentData =
    await contract.agents(agentAddress);

  console.log("Authorized:", agentData.authorized);
  console.log(
    "Spending limit:",
    agentData.spendingLimit.toString()
  );
  console.log("Spent:", agentData.spent.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});