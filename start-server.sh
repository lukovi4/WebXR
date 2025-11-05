#!/bin/bash

# Simple HTTPS server starter script

echo "Starting HTTPS server for WebXR..."
echo "Make sure you have created cert.pem and key.pem files first!"
echo ""

# Check if certificates exist
if [ ! -f "cert.pem" ] || [ ! -f "key.pem" ]; then
    echo "Certificates not found. Creating self-signed certificate..."
    openssl req -new -x509 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=Dev/CN=localhost"
    echo "Certificates created!"
fi

echo ""
echo "Starting Python HTTPS server on port 8443..."
echo "Open in Meta Quest browser: https://$(ipconfig getifaddr en0):8443"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python HTTPS server
python3 << 'EOF'
import http.server
import ssl
import socket

# Get local IP
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)

# Server settings
server_address = ('0.0.0.0', 8443)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

# SSL context
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('cert.pem', 'key.pem')
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"Server running at:")
print(f"  - https://localhost:8443")
print(f"  - https://{local_ip}:8443")
print(f"\nOpen this URL in your Meta Quest 3 browser")

httpd.serve_forever()
EOF
