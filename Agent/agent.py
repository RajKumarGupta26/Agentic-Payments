import json
import requests

from config import SERVICE_ID
from provider_client import ProviderClient
from delivery import create_delivery_proof


P4_URL = "http://127.0.0.1:8001"


def main():
    service_id = SERVICE_ID

    import sys
    if len(sys.argv) > 1:
        service_id = sys.argv[1]

    print("=" * 60)
    print("AGENTPAY AI AGENT")
    print("=" * 60)

    client = ProviderClient()

    try:
        result = client.request_service(service_id)

        if result["status"] != "available":
            print("[Agent] Service unavailable.")
            return

        # Create cryptographic delivery proof
        proof = create_delivery_proof(result["data"])
        result["delivery_proof"] = proof

        print("\n[Agent] Final Result:")
        print(json.dumps(result, indent=2))

        # Send REAL result to P4 dashboard
        try:
            dashboard_response = requests.post(
                f"{P4_URL}/api/agent/result",
                json=result,
                timeout=5,
            )

            print(
                f"\n[Agent] Dashboard sync: "
                f"{dashboard_response.status_code}"
            )

            if dashboard_response.ok:
                print("[Agent] ✓ Result delivered to P4 dashboard")
            else:
                print(
                    "[Agent] Dashboard rejected result:",
                    dashboard_response.text,
                )

        except requests.RequestException as e:
            print(f"[Agent] Dashboard sync failed: {e}")

    except Exception as e:
        print(f"\n[Agent] ERROR: {e}")


if __name__ == "__main__":
    main()