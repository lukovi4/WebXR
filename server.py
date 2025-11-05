#!/usr/bin/env python3
import http.server
import ssl
import os

# Change to script directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Server settings
PORT = 8443
server_address = ('0.0.0.0', PORT)

# Create HTTP server
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

# SSL context
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('cert.pem', 'key.pem')
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"HTTPS Server running on port {PORT}")
print(f"\nOpen in Meta Quest 3:")
print(f"  https://192.168.50.229:{PORT}")
print(f"\nOr locally:")
print(f"  https://localhost:{PORT}")
print(f"\nPress Ctrl+C to stop\n")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped")
