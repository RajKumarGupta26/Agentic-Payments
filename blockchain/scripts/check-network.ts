import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();

  const [wallet] = await ethers.getSigners();

  console.log("Wallet:", wallet.address);

  const balance =
    await ethers.provider.getBalance(wallet.address);

  console.log(
    "Balance:",
    ethers.formatEther(balance),
    "ETH"
  );

  const networkInfo =
    await ethers.provider.getNetwork();

  console.log(
    "Chain ID:",
    networkInfo.chainId.toString()
  );

  console.log("Network connection successful!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});