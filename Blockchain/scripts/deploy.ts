import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const [deployer] = await ethers.getSigners();

  const tokenAddress = process.env.PAYMENT_TOKEN_ADDRESS;

  if (!tokenAddress) {
    throw new Error(
      "PAYMENT_TOKEN_ADDRESS is missing from .env"
    );
  }

  console.log("========================================");
  console.log("AgenticPayments Deployment");
  console.log("========================================");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Payment token:", tokenAddress);

  const balance = await ethers.provider.getBalance(
    deployer.address
  );

  console.log(
    "Deployer balance:",
    ethers.formatEther(balance),
    "ETH"
  );

  console.log("\nDeploying AgenticPayments...");

  const AgenticPayments =
    await ethers.getContractFactory("AgenticPayments");

  const paymentContract = await AgenticPayments.deploy(
    tokenAddress
  );

  await paymentContract.waitForDeployment();

  const contractAddress =
    await paymentContract.getAddress();

  console.log("\n========================================");
  console.log("DEPLOYMENT SUCCESSFUL");
  console.log("========================================");
  console.log("Network: Base Sepolia");
  console.log("Chain ID: 84532");
  console.log("AgenticPayments:", contractAddress);
  console.log("Payment Token:", tokenAddress);
  console.log("Owner:", deployer.address);
  console.log("========================================");
}

main().catch((error) => {
  console.error("\nDeployment failed:");
  console.error(error);
  process.exitCode = 1;
});