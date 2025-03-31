import os
from flask import request, jsonify
from utils import post_to_api, switch_exists
from device_handlers import run_cisco_commands, is_cisco_device

def initialize_routes(app):

    @app.route('/api/cisco/add_switch', methods=['POST'])
    def add_switch():
        ip_address = request.json.get('ip_address')
        password = request.json.get('password')

        if not ip_address:
            return jsonify({"error": "IP address is required"}), 400

        if not password:
            return jsonify({"error": "Password is required"}), 400

        if password != os.getenv("API_PASSWORD"):
            return jsonify({"error": "Invalid password"}), 403

        if not is_cisco_device(ip_address):
            return jsonify({"error": "Not a Cisco device"}), 400

        return process_switch(ip_address)

    @app.route('/api/cisco/update_switch', methods=['POST'])
    def update_switch():
        ip_address = request.json.get('ip_address')

        if not ip_address:
            return jsonify({"error": "IP address is required"}), 400

        if not switch_exists(ip_address):
            return jsonify({"error": "Switch not found in the database"}), 404

        return process_switch(ip_address)

    def process_switch(ip_address):
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
            api_url = os.getenv("API_TO_DB") + "/api/db/store_data"
            post_to_api(api_url, combined_data)
            
            return jsonify({"message": "Data updated successfully","data": combined_data}), 200

        return jsonify({"error": "Failed to retrieve switch data"}), 500