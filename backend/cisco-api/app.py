import os
from dotenv import load_dotenv
from netmiko import ConnectHandler
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import socket

load_dotenv()

app = Flask(__name__)
CORS(app)

def post_to_api(url, data):
    try:
        response = requests.post(url, json=data, headers={"Content-Type": "application/json"})
        if response.status_code == 201:
            print(f"Successfully posted to {url}")
        else:
            print(f"Failed to post to {url}: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error posting to API: {e}")

def run_cisco_commands(host_data, commands):
    try:
        if is_cisco_device(host_data['host']):
            with ConnectHandler(**host_data) as net_connect:
                output = {}
                for command in commands:
                    output[command] = net_connect.send_command(command, use_textfsm=True)
                return output
    except Exception as e:
        print(f"Error posting to Cisco: {e}")
        return {}

def is_cisco_device(host, port=22):
    try:
        # Create a socket and connect to the device
        sock = socket.create_connection((host, port), timeout=2)
        
        # Receive the SSH banner (first 1024 bytes)
        banner = sock.recv(1024).decode('utf-8', errors='ignore')
        sock.close()
        return "Cisco" in banner
    except Exception as e:
        print(f"Error connecting to: {e}")
        return False

@app.route('/update_switch', methods=['POST'])
def update_switch():
    ip_address = request.json.get('ip_address')
    if not ip_address:
        return jsonify({"error": "IP address is required"}), 400

    host_data = {
        "device_type": "cisco_ios",
        "host": ip_address,
        "username": os.getenv("HOST_USERNAME"),
        "password": os.getenv("HOST_PASSWORD"),
    }

    commands = ["show interfaces status", "show mac address-table", "show version", "show arp", "show lldp neighbors detail"]
    output = run_cisco_commands(host_data, commands)

    if output:
        interfaces_status = output["show interfaces status"]
        mac_address_table = output["show mac address-table"]
        switch_version = output["show version"][0]
        arp_table = output["show arp"]
        lldp_neighbors = output["show lldp neighbors detail"]

        switch_stats = {
            "uptime": switch_version['uptime'],
            "hostname": switch_version['hostname'],
            "ip_address": host_data['host'],
            "hardware": switch_version['hardware'],
            "serial": switch_version['serial'],
            "mac_address": switch_version['mac_address']
        }

        interface_stats = []

        for port_info in interfaces_status:
            combined_entry = port_info.copy()  # Start with the interface data
            port = port_info['port']

            # Find the corresponding MAC address for this port
            mac_info = next((mac for mac in mac_address_table if port in mac['destination_port']), None)
            if mac_info:
                combined_entry['mac_address'] = mac_info['destination_address']
                
                # Find the corresponding IP address for this MAC
                arp_info = next((arp for arp in arp_table if arp['hardware_address'] == mac_info['destination_address']), None)
                if arp_info:
                    combined_entry['ip_address'] = arp_info['address']
                else:
                    combined_entry['ip_address'] = 'N/A'
            else:
                combined_entry['mac_address'] = 'N/A'
                combined_entry['ip_address'] = 'N/A'

            # Find the corresponding LLDP neighbor for this port
            lldp_info = next((lldp for lldp in lldp_neighbors if lldp['local_interface'] == port), None)
            if lldp_info:
                combined_entry['lldp_neighbor'] = lldp_info.get('neighbor_interface', '')
                combined_entry['lldp_neighbor_device'] = lldp_info.get('neighbor_name', '')
                combined_entry['lldp_neighbor_mgmt_ip'] = lldp_info.get('mgmt_address', '')
            else:
                combined_entry['lldp_neighbor'] = ''
                combined_entry['lldp_neighbor_device'] = ''
                combined_entry['lldp_neighbor_mgmt_ip'] = ''

            combined_entry['switch_name'] = switch_version['hostname']

            interface_stats.append(combined_entry)

        combined_data = {
            "switch_stats": switch_stats,
            "interface_stats": interface_stats
        }

        # Post combined data to API
        api_url = os.getenv("API_TO_DB") + "/store_data"
        post_to_api(api_url, combined_data)
        
        return jsonify({"message": "Data updated successfully","data": combined_data}), 200

    return jsonify({"error": "Failed to retrieve switch data"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)
