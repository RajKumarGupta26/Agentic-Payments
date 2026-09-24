import os
from typing import Dict, List

from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

RPC_URL = "https://sepolia.base.org"
CONTRACT_ADDRESS = "0x83f624259c83dD597560A2A7469B94da99Ccd477"
USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

# P1 registered agent
AGENT_ADDRESS = "0x60fbC30EF662f3813Ce6F9c9e2c0489ada4c6D53"

ABI = [
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "agents",
        "outputs": [
            {"internalType": "bool", "name": "authorized", "type": "bool"},
            {"internalType": "uint256", "name": "spendingLimit", "type": "uint256"},
            {"internalType": "uint256", "name": "spent", "type": "uint256"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "paymentToken",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function",
    },
]

class BlockchainService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(RPC_URL))
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(CONTRACT_ADDRESS),
            abi=ABI,
        )

    def get_budget(self) -> Dict:
        try:
            agent = self.contract.functions.agents(
                Web3.to_checksum_address(AGENT_ADDRESS)
            ).call()

            authorized = agent[0]
            limit = agent[1]
            spent = agent[2]

            # USDC has 6 decimals
            limit_usdc = limit / 1_000_000
            spent_usdc = spent / 1_000_000

            return {
                "authorized": authorized,
                "budget": limit_usdc,
                "spending_limit": limit_usdc,
                "spent": spent_usdc,
                "remaining": max(limit_usdc - spent_usdc, 0),
                "currency": "USDC",
                "network": "Base Sepolia",
                "chain_id": 84532,
                "agent": AGENT_ADDRESS,
                "contract": CONTRACT_ADDRESS,
                "source": "P1 AgenticPayments blockchain",
            }

        except Exception as e:
            return {
                "authorized": False,
                "budget": 0,
                "spending_limit": 0,
                "spent": 0,
                "remaining": 0,
                "currency": "USDC",
                "network": "Base Sepolia",
                "source": "blockchain_error",
                "error": str(e),
            }

    def payments_list(self) -> List[Dict]:
        """
        Read PaymentMade events from the P1 contract.
        """
        try:
            event_abi = {
                "anonymous": False,
                "inputs": [
                    {
                        "indexed": True,
                        "internalType": "address",
                        "name": "agent",
                        "type": "address",
                    },
                    {
                        "indexed": True,
                        "internalType": "address",
                        "name": "merchant",
                        "type": "address",
                    },
                    {
                        "indexed": False,
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256",
                    },
                ],
                "name": "PaymentMade",
                "type": "event",
            }

            event_contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(CONTRACT_ADDRESS),
                abi=[event_abi],
            )

            latest = self.w3.eth.block_number
            start = max(latest - 50000, 0)

            logs = event_contract.events.PaymentMade.get_logs(
                from_block=start,
                to_block=latest,
            )

            payments = []

            for log in logs:
                block = self.w3.eth.get_block(log["blockNumber"])

                payments.append({
                    "id": log["transactionHash"].hex(),
                    "agent": log["args"]["agent"],
                    "merchant": log["args"]["merchant"],
                    "amount": log["args"]["amount"] / 1_000_000,
                    "currency": "USDC",
                    "status": "confirmed",
                    "tx_hash": log["transactionHash"].hex(),
                    "block": log["blockNumber"],
                    "timestamp": block["timestamp"],
                    "network": "Base Sepolia",
                })

            return list(reversed(payments))

        except Exception:
            return []


blockchain_service = BlockchainService()