import os
import traceback
from flask import request, jsonify
from utils import post_to_api, switch_exists, switch_platform
from device_handlers.cisco_handler import run_cisco_commands, is_cisco_device, process_cisco_output
from device_handlers.arista_handler import run_arista_commands, is_arista_device, process_arista_output
from device_handlers.legacy_handler import fetch_legacy_data, process_legacy_output  # Make sure to import your legacy handlers

def initialize_routes(app):

    @app.route('/api/cisco/add_switch', methods=['POST'])
    def add_switch():
        ip_address = request.json.get('ip_address')
        password = request.json.get('password')
        platform = request.json.get('platform')
 
        if not ip_address:
            return jsonify({"error": "IP address is required"}), 400

        if not password:
            return jsonify({"error": "Password is required"}), 400

        if password != os.getenv("API_PASSWORD"):
            return jsonify({"error": "Invalid password"}), 403

        if not platform:
            return jsonify({"error": "Platform is required"}), 400

        if platform == "cisco_ios" and is_cisco_device(ip_address):
            return process_switch(ip_address, platform)
        # elif platform == "arista_eos" and is_arista_device(ip_address):
        elif platform == "arista_eos":

            return process_switch(ip_address, platform)
        else:
            return jsonify({"error": "Unsupported device type or incorrect platform"}), 400

    @app.route('/api/cisco/update_switch', methods=['POST'])
    def update_switch():
        ip_address = request.json.get('ip_address')

        if not ip_address:
            return jsonify({"error": "IP address is required"}), 400

        if not switch_exists(ip_address):
            return jsonify({"error": "Switch not found in the database"}), 404

        platform = switch_platform(ip_address)
        print(platform)
        if not platform:
            return jsonify({"error": "Platform is required"}), 400
    
        if platform == "cisco_ios" and is_cisco_device(ip_address):
            return process_switch(ip_address, platform)
        # elif platform == "arista_eos" and is_arista_device(ip_address):
        elif platform == "arista_eos":
            return process_switch(ip_address, platform)
        else:
            return jsonify({"error": "Unsupported device type or incorrect platform"}), 400

    def process_switch(ip_address, platform):
        host_data = {
            "host": ip_address,
            "username": os.getenv("HOST_USERNAME"),
            "password": os.getenv("HOST_PASSWORD"),
            "device_type": platform,
            
        }

        if platform == "cisco_ios":
            commands = ["show interfaces status", "show mac address-table", "show version", "show arp", "show lldp neighbors detail", "show power inline","show interfaces"]
            output = run_cisco_commands(host_data, commands)
            processed_data = process_cisco_output(output, host_data)
        elif platform == "arista_eos":
            commands = ["show interfaces status", "show mac address-table", "show version", "show arp", "show lldp neighbors detail", "show hostname"]
            output = run_arista_commands(host_data, commands)
            processed_data = process_arista_output(output, host_data)
        else:
            return jsonify({"error": "Unsupported device type"}), 400

        if isinstance(output, str):
            return jsonify({"error": output}), 400

        try:
            # Post combined data to API
            api_url = os.getenv("API_TO_DB") + "/api/db/store_data"
            post_to_api(api_url, processed_data)

            return jsonify({"message": "Data updated successfully", "data": processed_data}), 200

        except Exception as e:
            print(f"Error processing output: {e}")
            return jsonify({"error": "Failed to process switch data"}), 500

    @app.route('/api/legacy_data', methods=['POST'])
    def legacy_data():
        ip_address = request.json.get('ip_address')
        deaddays = request.json.get('deaddays', 14)

        if not ip_address:
            return jsonify({"error": "IP address is required"}), 400

        try:
            hostname, table_data, uptime, fqdn = fetch_legacy_data(ip_address, deaddays)
            processed_data = process_legacy_output(hostname, table_data, {"host": ip_address}, uptime, fqdn)

            return jsonify({"data": processed_data}), 200

        except Exception as e:
            print(f"An error occurred: {e}")
            print(traceback.format_exc())
            return jsonify({"error": f"Failed to fetch or process legacy data."}), 500