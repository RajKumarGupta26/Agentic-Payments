from provider_client import ProviderClient, PaymentRequired


client = ProviderClient()

try:

    client.request_service("weather-report")

except PaymentRequired as error:

    print("\n===== PAYMENT REQUIRED =====")

    print(
        "Provider:",
        error.payment_requirements["provider"]
    )

    print(
        "Amount:",
        error.payment_requirements["amount"]
    )

    print(
        "Token:",
        error.payment_requirements["token"]
    )

    print(
        "Nonce:",
        error.payment_requirements["nonce"]
    )

    print("============================")