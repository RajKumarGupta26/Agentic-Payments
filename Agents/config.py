import os
from dotenv import load_dotenv

load_dotenv()

# Provider URL
PROVIDER_URL = os.getenv(
    "PROVIDER_URL",
    "http://localhost:4000"
)

# Example service
SERVICE_ID = os.getenv(
    "SERVICE_ID",
    "weather-report"
)