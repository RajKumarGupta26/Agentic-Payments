from http.server import BaseHTTPRequestHandler, HTTPServer
import json


class ProviderHandler(BaseHTTPRequestHandler):

    def do_GET(self):

        if self.path.startswith("/service/"):

            payment_requirements = {
                "provider": "0xPROVIDER",
                "amount": "0.01",
                "token": "ETH",
                "nonce": "demo-nonce-001"
            }

            self.send_response(402)
            self.send_header(
                "Content-Type",
                "application/json"
            )
            self.end_headers()

            self.wfile.write(
                json.dumps(payment_requirements).encode()
            )

            return

        self.send_response(404)
        self.end_headers()


server = HTTPServer(
    ("localhost", 3000),
    ProviderHandler
)

print("Mock Provider running on http://localhost:3000")

server.serve_forever()