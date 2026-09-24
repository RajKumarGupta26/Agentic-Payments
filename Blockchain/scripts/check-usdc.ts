import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const wallet = (await ethers.getSigners())[0];

  const usdcAddress =
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  const paymentContractAddress =
    "0x8a7648aA1bC324f940F0f5652D44f09927cA2Adf";

  const usdc = await ethers.getContractAt(
    [
      "function balanceOf(address account) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ],
    usdcAddress
  );

  const paymentContract = await ethers.getContractAt(
    [
      "function paymentToken() view returns (address)",
      "function owner() view returns (address)"
    ],
    paymentContractAddress
  );

  const balance = await usdc.balanceOf(wallet.address);
  const decimals = await usdc.decimals();
  const symbol = await usdc.symbol();

  const configuredToken =
    await paymentContract.paymentToken();

  const owner =
    await paymentContract.owner();

  console.log("========================================");
  console.log("Base Sepolia USDC Check");
  console.log("========================================");

  console.log("Wallet:", wallet.address);
  console.log(
    "USDC Balance:",
    ethers.formatUnits(balance, decimals),
    symbol
  );

  console.log("USDC Contract:", usdcAddress);
  console.log(
    "AgenticPayments:",
    paymentContractAddress
  );

  console.log(
    "Configured Payment Token:",
    configuredToken
  );

  console.log("Contract Owner:", owner);

  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});