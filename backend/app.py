import socket
from flask import Flask, request, jsonify
from flask_cors import CORS
from getmac import get_mac_address
import re

app = Flask(__name__)
CORS(app)

EXAMPLE_CONFIG = """
Port      Name               Status       Vlan       Duplex  Speed   Type
Gi1/0/1                     connected    10         full    1000    10/100/1000BaseTX
Gi1/0/2                     notconnect   20         auto    auto    10/100/1000BaseTX
Gi1/0/3                     connected    30         full    1000    10/100/1000BaseTX
Gi1/0/4                     err-disabled 40         full    1000    10/100/1000BaseTX
Gi1/0/5                     disabled     50         auto    auto    10/100/1000BaseTX
Te1/1/1                     connected    trunk      full    10000   10GBase-SR
Te1/1/2                     notconnect   trunk      auto    auto    10GBase-SR
"""


def parse_cisco_output(data):
    lines = data.strip().split("\n")
    headers = re.split(r'\s{2,}', lines[0].strip())
    
    parsed_data = []
    for line in lines[1:]:
        values = re.split(r'\s{2,}', line.strip())
        entry = dict(zip(headers, values))
        parsed_data.append(entry)
    
    return parsed_data

# Check if device is a Cisco switch based on SSH banner
def is_cisco_device(ip):
    try:
        # Try to connect to the IP address over socket (without SSH authentication)
        sock = socket.create_connection((ip, 22), timeout=2)
        sock.settimeout(2)
        
        # Capture the banner (before any authentication prompt)
        banner = sock.recv(1024).decode('utf-8', errors='ignore')
        if "Cisco" in banner:
            sock.close()
            return True
        
        sock.close()
        return False
    except Exception as e:
        print(f"Error (is_cisco_device): {e}")
        return False

@app.route('/check_device', methods=['GET'])
def check_device():
    ip = request.args.get("ip")
    if not ip:
        return jsonify({"error (check_device)": "No IP address provided"}), 400

    # Check if the device is a Cisco network device by SSH banner
    is_cisco = is_cisco_device(ip)
    
    return jsonify({"ip": ip, "is_cisco": is_cisco})

@app.route('/config', methods=['GET'])
def get_config():
    ip = request.args.get("ip")
    if not ip:
        return jsonify({"error (get_config)": "No IP address provided"}), 400
    
    # Check if the device is a Cisco network device by SSH banner
    is_cisco = is_cisco_device(ip)
    
    if not is_cisco:
        return jsonify({"is_cisco": is_cisco})
    
    parsed_data = parse_cisco_output(EXAMPLE_CONFIG)
    return jsonify({"is_cisco": is_cisco, "config": parsed_data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
