import { expect } from "chai";
import { network } from "hardhat";

describe("AgenticPayments", function () {
  async function deployContracts() {
    const { ethers } = await network.connect();

    const [owner, agent, merchant, stranger] =
      await ethers.getSigners();

    const MockToken = await ethers.getContractFactory("MockToken");
    const token = await MockToken.deploy();
    await token.waitForDeployment();

    const AgenticPayments =
      await ethers.getContractFactory("AgenticPayments");

    const contract = await AgenticPayments.deploy(
      await token.getAddress()
    );

    await contract.waitForDeployment();

    return {
      contract,
      token,
      owner,
      agent,
      merchant,
      stranger,
    };
  }

  it("should allow owner to register an agent", async function () {
    const { contract, agent } = await deployContracts();

    await contract.registerAgent(agent.address, 100);

    const agentData = await contract.agents(agent.address);

    expect(agentData.authorized).to.equal(true);
    expect(agentData.spendingLimit).to.equal(100n);
    expect(agentData.spent).to.equal(0n);
  });

  it("should emit AgentRegistered when an agent is registered", async function () {
    const { contract, agent } = await deployContracts();

    await expect(
      contract.registerAgent(agent.address, 100)
    )
      .to.emit(contract, "AgentRegistered")
      .withArgs(agent.address, 100);
  });

  it("should reject registration by non-owner", async function () {
    const { contract, agent, stranger } =
      await deployContracts();

    await expect(
      contract
        .connect(stranger)
        .registerAgent(agent.address, 100)
    ).to.be.revertedWith("Only owner can register agent");
  });

  it("should allow an authorized agent to make a payment", async function () {
    const {
      contract,
      token,
      agent,
      merchant,
    } = await deployContracts();

    await contract.registerAgent(agent.address, 100);

    await token.mint(agent.address, 1000);

    await token
      .connect(agent)
      .approve(await contract.getAddress(), 1000);

    await expect(
      contract
        .connect(agent)
        .makePayment(merchant.address, 30)
    )
      .to.emit(contract, "PaymentMade")
      .withArgs(agent.address, merchant.address, 30);

    const agentData = await contract.agents(agent.address);

    expect(agentData.spent).to.equal(30n);

    expect(
      await token.balanceOf(agent.address)
    ).to.equal(970n);

    expect(
      await token.balanceOf(merchant.address)
    ).to.equal(30n);
  });

  it("should reject payment from unauthorized agent", async function () {
    const {
      contract,
      stranger,
      merchant,
    } = await deployContracts();

    await expect(
      contract
        .connect(stranger)
        .makePayment(merchant.address, 30)
    ).to.be.revertedWith("Agent is not authorized");
  });

  it("should reject payment exceeding spending limit", async function () {
    const {
      contract,
      token,
      agent,
      merchant,
    } = await deployContracts();

    await contract.registerAgent(agent.address, 100);

    await token.mint(agent.address, 1000);

    await token
      .connect(agent)
      .approve(await contract.getAddress(), 1000);

    await contract
      .connect(agent)
      .makePayment(merchant.address, 60);

    await expect(
      contract
        .connect(agent)
        .makePayment(merchant.address, 50)
    ).to.be.revertedWith("Spending limit exceeded");

    const agentData = await contract.agents(agent.address);

    expect(agentData.spent).to.equal(60n);
  });

  it("should allow owner to revoke an agent", async function () {
    const {
      contract,
      agent,
    } = await deployContracts();

    await contract.registerAgent(agent.address, 100);

    await contract.revokeAgent(agent.address);

    const agentData = await contract.agents(agent.address);

    expect(agentData.authorized).to.equal(false);
  });

  it("should emit AgentRevoked when an agent is revoked", async function () {
    const {
      contract,
      agent,
    } = await deployContracts();

    await contract.registerAgent(agent.address, 100);

    await expect(
      contract.revokeAgent(agent.address)
    )
      .to.emit(contract, "AgentRevoked")
      .withArgs(agent.address);
  });

  it("should reject payment after agent is revoked", async function () {
    const {
      contract,
      token,
      agent,
      merchant,
    } = await deployContracts();

    await contract.registerAgent(agent.address, 100);

    await token.mint(agent.address, 1000);

    await token
      .connect(agent)
      .approve(await contract.getAddress(), 1000);

    await contract.revokeAgent(agent.address);

    await expect(
      contract
        .connect(agent)
        .makePayment(merchant.address, 30)
    ).to.be.revertedWith("Agent is not authorized");
  });

  it("should reject revocation by non-owner", async function () {
    const {
      contract,
      agent,
      stranger,
    } = await deployContracts();

    await contract.registerAgent(agent.address, 100);

    await expect(
      contract
        .connect(stranger)
        .revokeAgent(agent.address)
    ).to.be.revertedWith("Only owner can revoke agent");
  });

  it("should reject payment when token allowance is insufficient", async function () {
    const {
      contract,
      token,
      agent,
      merchant,
    } = await deployContracts();

    await contract.registerAgent(agent.address, 100);

    await token.mint(agent.address, 1000);

    await token
      .connect(agent)
      .approve(await contract.getAddress(), 20);

    await expect(
      contract
        .connect(agent)
        .makePayment(merchant.address, 30)
    ).to.be.revertedWith("Insufficient allowance");

    const agentData = await contract.agents(agent.address);

    expect(agentData.spent).to.equal(0n);

    expect(
      await token.balanceOf(merchant.address)
    ).to.equal(0n);
  });
});