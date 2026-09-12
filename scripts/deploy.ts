import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts...");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);

  // Deploy MockToken
  const MockToken = await ethers.getContractFactory("MockToken");

  const token = await MockToken.deploy();

  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();

  console.log("MockToken deployed to:", tokenAddress);

  // Deploy AgenticPayments
  const AgenticPayments =
    await ethers.getContractFactory("AgenticPayments");

  const paymentContract = await AgenticPayments.deploy(
    tokenAddress
  );

  await paymentContract.waitForDeployment();

  const paymentContractAddress =
    await paymentContract.getAddress();

  console.log(
    "AgenticPayments deployed to:",
    paymentContractAddress
  );

  console.log("\nDeployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});