import { network } from "hardhat";
import { ethers } from "ethers";

async function main() {
  const { ethers: hardhatEthers } = await network.create();

  const agentPrivateKey = process.env.AGENT_PRIVATE_KEY;

  if (!agentPrivateKey) {
    throw new Error(
      "AGENT_PRIVATE_KEY is missing from .env"
    );
  }

  const agent = new hardhatEthers.Wallet(
    agentPrivateKey,
    hardhatEthers.provider
  );

  const paymentContractAddress =
    "0x83f624259c83dD597560A2A7469B94da99Ccd477";

  const usdcAddress =
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  const merchantAddress =
    "0xC0b8433b86ad65A6DBcafa184130EdE1A206478c";

  // 1 USDC because USDC has 6 decimals
  const amount = 1_000_000n;

  console.log("=================================");
  console.log("REAL AGENTIC PAYMENT DEMO");
  console.log("=================================");

  console.log("Agent:", agent.address);
  console.log("Merchant:", merchantAddress);
  console.log("Payment Contract:", paymentContractAddress);
  console.log("USDC:", usdcAddress);
  console.log("Amount: 1 USDC");

  // --------------------------------------------------
  // 1. Check Agent ETH
  // --------------------------------------------------

  const ethBalance =
    await hardhatEthers.provider.getBalance(
      agent.address
    );

  console.log(
    "\nAgent ETH:",
    hardhatEthers.formatEther(ethBalance)
  );

  if (ethBalance === 0n) {
    throw new Error(
      "Agent has no Base Sepolia ETH for gas"
    );
  }

  // --------------------------------------------------
  // 2. Connect to USDC
  // --------------------------------------------------

  const usdc = new hardhatEthers.Contract(
    usdcAddress,
    [
      "function balanceOf(address) view returns (uint256)",
      "function allowance(address,address) view returns (uint256)",
      "function approve(address,uint256) returns (bool)",
    ],
    agent
  );

  // --------------------------------------------------
  // 3. Check balances BEFORE payment
  // --------------------------------------------------

  const agentBalance =
    await usdc.balanceOf(agent.address);

  const merchantBalanceBefore =
    await usdc.balanceOf(merchantAddress);

  console.log(
    "Agent USDC before:",
    hardhatEthers.formatUnits(agentBalance, 6)
  );

  console.log(
    "Merchant USDC before:",
    hardhatEthers.formatUnits(
      merchantBalanceBefore,
      6
    )
  );

  if (agentBalance < amount) {
    throw new Error(
      "Agent does not have enough USDC"
    );
  }

  // --------------------------------------------------
  // 4. Connect to AgenticPayments
  // --------------------------------------------------

  const paymentContract =
    await hardhatEthers.getContractAt(
      "AgenticPayments",
      paymentContractAddress,
      agent
    );

  // --------------------------------------------------
  // 5. Verify Agent authorization
  // --------------------------------------------------

  const agentData =
    await paymentContract.agents(
      agent.address
    );

  console.log(
    "\nAgent authorized:",
    agentData.authorized
  );

  console.log(
    "Spending limit:",
    hardhatEthers.formatUnits(
      agentData.spendingLimit,
      6
    ),
    "USDC"
  );

  console.log(
    "Already spent:",
    hardhatEthers.formatUnits(
      agentData.spent,
      6
    ),
    "USDC"
  );

  if (!agentData.authorized) {
    throw new Error(
      "Agent is not authorized in AgenticPayments"
    );
  }

  // --------------------------------------------------
  // 6. Approve AgenticPayments contract
  // --------------------------------------------------

  const currentAllowance =
    await usdc.allowance(
      agent.address,
      paymentContractAddress
    );

  console.log(
    "\nCurrent allowance:",
    hardhatEthers.formatUnits(
      currentAllowance,
      6
    ),
    "USDC"
  );

  if (currentAllowance < amount) {
    console.log(
      "Approving AgenticPayments to spend 1 USDC..."
    );

    const approvalTx =
      await usdc.approve(
        paymentContractAddress,
        amount
      );

    console.log(
      "Approval transaction:",
      approvalTx.hash
    );

    await approvalTx.wait();

    console.log("Approval confirmed!");
  } else {
    console.log(
      "Existing allowance is sufficient."
    );
  }

  // --------------------------------------------------
  // 7. Make REAL payment
  // --------------------------------------------------

  console.log(
    "\nSending 1 USDC to Demo Merchant..."
  );

  const paymentTx =
    await paymentContract.makePayment(
      merchantAddress,
      amount
    );

  console.log(
    "Payment transaction:",
    paymentTx.hash
  );

  const receipt =
    await paymentTx.wait();

  console.log(
    "Payment confirmed!"
  );

  // --------------------------------------------------
  // 8. Check balances AFTER payment
  // --------------------------------------------------

  const agentBalanceAfter =
    await usdc.balanceOf(agent.address);

  const merchantBalanceAfter =
    await usdc.balanceOf(
      merchantAddress
    );

  const agentDataAfter =
    await paymentContract.agents(
      agent.address
    );

  console.log(
    "\nAgent USDC after:",
    hardhatEthers.formatUnits(
      agentBalanceAfter,
      6
    )
  );

  console.log(
    "Merchant USDC after:",
    hardhatEthers.formatUnits(
      merchantBalanceAfter,
      6
    )
  );

  console.log(
    "Agent total spent:",
    hardhatEthers.formatUnits(
      agentDataAfter.spent,
      6
    ),
    "USDC"
  );

  console.log(
    "\nBlock:",
    receipt?.blockNumber
  );

  console.log(
    "\n================================="
  );
  console.log(
    "REAL PAYMENT SUCCESSFUL"
  );
  console.log(
    "================================="
  );

  console.log(
    "Agent:",
    agent.address
  );

  console.log(
    "Merchant:",
    merchantAddress
  );

  console.log(
    "Amount: 1 USDC"
  );

  console.log(
    "Transaction:",
    paymentTx.hash
  );

  console.log(
    "================================="
  );
}

main().catch((error) => {
  console.error("\nPAYMENT FAILED:");
  console.error(error);
  process.exitCode = 1;
});