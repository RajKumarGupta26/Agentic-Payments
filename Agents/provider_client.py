import os
import json
import subprocess
import uuid

from config import PROVIDER_URL


class ProviderClient:
    def __init__(self, provider_url=PROVIDER_URL):
        self.provider_url = provider_url.rstrip("/")

    def request_service(self, service_id, retries=2):
        request_id = str(uuid.uuid4())

        print(f"[Agent] Request ID: {request_id}")

        for attempt in range(1, retries + 2):
            print(f"\n[Agent] Attempt {attempt}/{retries + 1}")
            print(f"[Agent] Requesting service: {service_id}")

            try:
                result = subprocess.run(
                    [
                        "node",
                        "--dns-result-order=ipv4first",
                        os.path.join(
                            os.path.dirname(__file__),
                            "x402-client",
                            "client.js",
                        ),
                        service_id,
                    ],
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    timeout=30,
                )

                print(result.stdout)

                if result.returncode != 0:
                    print("[Agent] x402 client failed.")

                    if attempt <= retries:
                        print("[Agent] Retrying same request...")
                        continue

                    raise RuntimeError(
                        "x402 client failed after retries."
                    )

                # -------------------------------------------------
                # Parse payment settlement information
                # -------------------------------------------------

                payment = None

                payment_marker = "Payment response:"

                if payment_marker in result.stdout:
                    payment_section = result.stdout.split(
                        payment_marker, 1
                    )[1]

                    provider_marker = "Provider response:"

                    if provider_marker in payment_section:
                        payment_json = payment_section.split(
                            provider_marker, 1
                        )[0].strip()
                    else:
                        payment_json = payment_section.strip()

                    # Payment response is printed as formatted JSON.
                    # Extract the JSON object safely.
                    start = payment_json.find("{")
                    end = payment_json.rfind("}")

                    if start != -1 and end != -1:
                        try:
                            payment = json.loads(
                                payment_json[start:end + 1]
                            )
                        except json.JSONDecodeError:
                            print(
                                "[Agent] Warning: "
                                "Could not parse payment response."
                            )

                # -------------------------------------------------
                # Parse provider response
                # -------------------------------------------------

                marker = "Provider response:"

                if marker not in result.stdout:
                    if attempt <= retries:
                        print("[Agent] Provider response missing.")
                        print("[Agent] Retrying same request...")
                        continue

                    raise RuntimeError(
                        "Provider response not found."
                    )

                response_text = result.stdout.split(
                    marker, 1
                )[1].strip()

                response_line = response_text.splitlines()[0].strip()

                data = json.loads(response_line)

                # -------------------------------------------------
                # Build final provider result
                # -------------------------------------------------

                response = {
                    "status": "available",
                    "data": data,
                    "attempt": attempt,
                    "request_id": request_id,
                    "idempotency_key": request_id,
                }

                if payment:
                    response["payment"] = payment

                return response

            except subprocess.TimeoutExpired:
                print("[Agent] Request timed out.")

                if attempt <= retries:
                    print("[Agent] Retrying same request...")
                    continue

                raise RuntimeError(
                    "Provider request timed out after retries."
                )

            except json.JSONDecodeError:
                print("[Agent] Invalid provider JSON.")

                if attempt <= retries:
                    print("[Agent] Retrying same request...")
                    continue

                raise RuntimeError(
                    "Invalid provider response after retries."
                )

        raise RuntimeError("Service request failed.")