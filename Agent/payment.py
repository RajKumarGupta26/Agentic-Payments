import os
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

RPC_URL = os.getenv("RPC_URL")
CONTRACT_ADDRESS = os.getenv("AGENTIC_PAYMENTS_ADDRESS")
TOKEN_ADDRESS = os.getenv("PAYMENT_TOKEN_ADDRESS")
PRIVATE_KEY = os.getenv("AGENT_PRIVATE_KEY")

AGENTIC_PAYMENTS_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "merchant", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "makePayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "name": "agents",
        "outputs": [
            {"internalType": "bool", "name": "authorized", "type": "bool"},
            {"internalType": "uint256", "name": "spendingLimit", "type": "uint256"},
            {"internalType": "uint256", "name": "spent", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "paymentToken",
        "outputs": [
            {"internalType": "contract IERC20", "name": "", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

TOKEN_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "account", "type": "address"}
        ],
        "name": "balanceOf",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "spender", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [
            {"internalType": "bool", "name": "", "type": "bool"}
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]


def approve_contract(w3, token, agent_address, amount):
    print("\n===== APPROVING USDC =====")

    nonce = w3.eth.get_transaction_count(agent_address)

    tx = token.functions.approve(
        Web3.to_checksum_address(CONTRACT_ADDRESS),
        amount
    ).build_transaction({
        "from": agent_address,
        "nonce": nonce,
        "chainId": 84532,
        "gas": 100000,
        "gasPrice": w3.eth.gas_price
    })

    signed_tx = w3.eth.account.sign_transaction(
        tx,
        private_key=PRIVATE_KEY
    )

    tx_hash = w3.eth.send_raw_transaction(
        signed_tx.raw_transaction
    )

    print("Approval transaction:", tx_hash.hex())
    print("Waiting for confirmation...")

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    if receipt.status != 1:
        raise RuntimeError("USDC approval transaction failed.")

    print("USDC approval successful.")

    return tx_hash.hex()


def make_payment(w3, contract, agent_address, merchant, amount):
    print("\n===== MAKING PAYMENT =====")
    print("Merchant:", merchant)
    print("Amount:", amount, "raw units")
    print("Amount:", amount / 1_000_000, "USDC")

    nonce = w3.eth.get_transaction_count(agent_address)

    tx = contract.functions.makePayment(
        Web3.to_checksum_address(merchant),
        amount
    ).build_transaction({
        "from": agent_address,
        "nonce": nonce,
        "chainId": 84532,
        "gas": 200000,
        "gasPrice": w3.eth.gas_price
    })

    signed_tx = w3.eth.account.sign_transaction(
        tx,
        private_key=PRIVATE_KEY
    )

    tx_hash = w3.eth.send_raw_transaction(
        signed_tx.raw_transaction
    )

    print("Payment transaction:", tx_hash.hex())
    print("Waiting for confirmation...")

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    if receipt.status != 1:
        raise RuntimeError("Payment transaction failed.")

    print("Payment successful!")

    return tx_hash.hex()


def main():
    print("Connecting to Base Sepolia...")

    if not RPC_URL:
        raise RuntimeError("RPC_URL missing from .env")

    if not CONTRACT_ADDRESS:
        raise RuntimeError("AGENTIC_PAYMENTS_ADDRESS missing from .env")

    if not TOKEN_ADDRESS:
        raise RuntimeError("PAYMENT_TOKEN_ADDRESS missing from .env")

    if not PRIVATE_KEY:
        raise RuntimeError("AGENT_PRIVATE_KEY missing from .env")

    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    if not w3.is_connected():
        raise RuntimeError("Could not connect to Base Sepolia")

    account = w3.eth.account.from_key(PRIVATE_KEY)
    agent_address = account.address

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=AGENTIC_PAYMENTS_ABI
    )

    print("Network connected.")
    print("Agent:", agent_address)
    print("Contract:", CONTRACT_ADDRESS)

    chain_id = w3.eth.chain_id
    print("Chain ID:", chain_id)

    if chain_id != 84532:
        raise RuntimeError(
            f"Wrong network. Expected Base Sepolia (84532), got {chain_id}"
        )

    contract_token = contract.functions.paymentToken().call()

    print("Configured payment token:", contract_token)
    print("Expected payment token:", TOKEN_ADDRESS)

    if (
        Web3.to_checksum_address(contract_token)
        != Web3.to_checksum_address(TOKEN_ADDRESS)
    ):
        raise RuntimeError(
            "Payment token mismatch between .env and deployed contract."
        )

    authorized, spending_limit, spent = (
        contract.functions.agents(agent_address).call()
    )

    print("\n===== AGENT STATUS =====")
    print("Authorized:", authorized)
    print("Spending limit:", spending_limit)
    print("Already spent:", spent)
    print("Remaining:", spending_limit - spent)

    if not authorized:
        raise RuntimeError(
            "This wallet is NOT authorized as an agent."
        )

    token = w3.eth.contract(
        address=Web3.to_checksum_address(TOKEN_ADDRESS),
        abi=TOKEN_ABI
    )

    balance = token.functions.balanceOf(agent_address).call()

    allowance = token.functions.allowance(
        agent_address,
        Web3.to_checksum_address(CONTRACT_ADDRESS)
    ).call()

    print("\n===== USDC STATUS =====")
    print("USDC balance:", balance)
    print("USDC balance:", balance / 1_000_000, "USDC")
    print("Contract allowance:", allowance)
    print("Allowance:", allowance / 1_000_000, "USDC")

    if balance < 10000:
        raise RuntimeError(
            "Not enough USDC for the 0.01 USDC weather payment."
        )

    if allowance < 10000:
        print("\nAllowance is too low.")
        print("Approving 0.10 USDC...")

        approve_contract(
            w3,
            token,
            agent_address,
            100000
        )

        new_allowance = token.functions.allowance(
            agent_address,
            Web3.to_checksum_address(CONTRACT_ADDRESS)
        ).call()

        print("New allowance:", new_allowance)
        print(
            "New allowance:",
            new_allowance / 1_000_000,
            "USDC"
        )
    else:
        print("\nAllowance is already sufficient.")

    print("\nNo service payment was sent.")


if __name__ == "__main__":
    main()