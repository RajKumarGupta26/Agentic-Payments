import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const [wallet] = await ethers.getSigners();

  const paymentContractAddress =
    "0x8a7648aA1bC324f940F0f5652D44f09927cA2Adf";

  const usdcAddress =
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  const paymentContract = await ethers.getContractAt(
    [
      "function owner() view returns (address)",
      "function paymentToken() view returns (address)",
      "function agents(address) view returns (bool,uint256,uint256)"
    ],
    paymentContractAddress
  );

  const usdc = await ethers.getContractAt(
    [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ],
    usdcAddress
  );

  const networkInfo =
    await ethers.provider.getNetwork();

  const blockNumber =
    await ethers.provider.getBlockNumber();

  const code =
    await ethers.provider.getCode(
      paymentContractAddress
    );

  const owner =
    await paymentContract.owner();

  const configuredToken =
    await paymentContract.paymentToken();

  const agentData =
    await paymentContract.agents(wallet.address);

  const usdcBalance =
    await usdc.balanceOf(wallet.address);

  const decimals =
    await usdc.decimals();

  const symbol =
    await usdc.symbol();

  console.log("========================================");
  console.log("DEPLOYMENT VERIFICATION");
  console.log("========================================");

  console.log("Chain ID:", networkInfo.chainId.toString());
  console.log("Block:", blockNumber);

  console.log("\nWallet:");
  console.log(wallet.address);

  console.log("\nContract:");
  console.log(paymentContractAddress);

  console.log(
    "Contract code exists:",
    code !== "0x"
  );

  console.log("\nContract owner:");
  console.log(owner);

  console.log("\nConfigured payment token:");
  console.log(configuredToken);

  console.log("\nAgent state:");
  console.log("Authorized:", agentData[0]);
  console.log(
    "Spending limit:",
    ethers.formatUnits(agentData[1], decimals),
    symbol
  );
  console.log(
    "Spent:",
    ethers.formatUnits(agentData[2], decimals),
    symbol
  );

  console.log("\nWallet USDC:");
  console.log(
    ethers.formatUnits(
      usdcBalance,
      decimals
    ),
    symbol
  );

  console.log("========================================");
}

main().catch((error) => {
  console.error("\nVerification failed:");
  console.error(error);
  process.exitCode = 1;
});