import os
import traceback
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import psycopg2
from psycopg2 import sql
from flask_cors import CORS
import re
import json
import requests
from collections import defaultdict

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database connection details
db_params = {
    'dbname': 'postgres',
    'user': 'postgres',
    'password': os.getenv("DB_PASSWORD"),
    'host': os.getenv("DB_HOST"),
    'port': os.getenv("DB_PORT"),
}

# SQL commands for creating tables
# SQL commands for creating tables
create_master_table = """
CREATE TABLE IF NOT EXISTS master_switch_stats (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(50),
    hardware VARCHAR(255)[],
    serial VARCHAR(255)[],
    mac_address VARCHAR(255)[],
    platform VARCHAR(50) NOT NULL
);
"""

create_historical_switch_table = """
CREATE TABLE IF NOT EXISTS historical_switch_stats (
    id SERIAL PRIMARY KEY,
    switch_id INTEGER REFERENCES master_switch_stats(id),
    uptime VARCHAR(255),
    total_power_usage VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

create_historical_interface_table = """
CREATE TABLE IF NOT EXISTS historical_interface_stats (
    id SERIAL PRIMARY KEY,
    switch_id INTEGER REFERENCES master_switch_stats(id),
    port VARCHAR(50),
    name VARCHAR(255),
    status VARCHAR(50),
    vlan_id VARCHAR(50),
    duplex VARCHAR(50),
    speed VARCHAR(50),
    type VARCHAR(255),
    fc_mode VARCHAR(50),
    mac_address VARCHAR(50),
    ip_address VARCHAR(50),
    switch_name VARCHAR(255),
    lldp_neighbor VARCHAR(255),
    lldp_neighbor_device VARCHAR(255),
    lldp_neighbor_mgmt_ip VARCHAR(50),
    poe_power_usage NUMERIC, 
    poe_device VARCHAR(255),  
    poe_class VARCHAR(50),
    delay VARCHAR(50),    
    description VARCHAR(255),
    encapsulation VARCHAR(50),
    hardware_type VARCHAR(50),
    interface VARCHAR(50),
    last_input VARCHAR(50),
    last_output VARCHAR(50),
    last_output_hang VARCHAR(50),
    link_status VARCHAR(50),
    media_type VARCHAR(50),
    mtu VARCHAR(50),
    output_errors VARCHAR(50),
    output_packets VARCHAR(50),
    output_pps VARCHAR(50),
    output_rate VARCHAR(50),
    protocol_status VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""


# Function to fetch data from the API
def fetch_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data from {url}: {response.status_code}")
        return None
def generate_network_tree(initial_url):
    data = fetch_data(initial_url)
    if data:
        true_stats = []
        false_stats = []
        processed_hostnames = set()  # Set to keep track of processed IPs

        def process_item(item):
            # Process FQDN to hostname
            if 'lldp_neighbor_device' in item and item['lldp_neighbor_device']:
                fqdn = item['lldp_neighbor_device']
                item['lldp_neighbor_device'] = fqdn.split('.')[0]  # Take the first part before the dot

            # Separate items based on exists_in_master_switch_stats
            if item['exists_in_master_switch_stats']:
                true_stats.append(item)
            else:
                false_stats.append(item)

            # Fetch LLDP neighbors if not already processed
            neighbor_hostname = item.get('neighbor_switch_hostname')
            if neighbor_hostname:
                neighbor_hostname = neighbor_hostname.split('.')[0]  # Normalize hostname
            if neighbor_hostname and neighbor_hostname not in processed_hostnames:
                processed_hostnames.add(neighbor_hostname)
                if item.get('exists_in_master_switch_stats'):
                    neighbor_url = f"http://127.0.0.1:5000/api/db/get_lldp_neighbors/{neighbor_hostname}"
                    neighbor_data = fetch_data(neighbor_url)
                    if neighbor_data:
                        for neighbor in neighbor_data:
                            process_item(neighbor)

        # Process the initial data
        for item in data:
            process_item(item)

        # Find the core switch in the true_stats list
        link_count = defaultdict(int)

        for item in true_stats:
            if 'lldp_neighbor_device' in item:
                link_count[item['lldp_neighbor_device']] += 1

        core_switch = max(link_count, key=link_count.get)

        # Check for the second core switch
        second_core_switch = None
        if core_switch.endswith('1'):
            potential_second_core = core_switch[:-1] + '2'
            # Check in true_stats and false_stats
            for item in true_stats + false_stats:
                if item.get('lldp_neighbor_device') == potential_second_core:
                    second_core_switch = potential_second_core
                    break
        elif core_switch.endswith('2'):
            potential_second_core = core_switch[:-1] + '1'
            for item in true_stats + false_stats:
                if item.get('lldp_neighbor_device') == potential_second_core:
                    second_core_switch = potential_second_core
                    break

        # Remove the second core switch from the lists if found
        if second_core_switch:
            true_stats = [item for item in true_stats if item['lldp_neighbor_device'] != second_core_switch]
            false_stats = [item for item in false_stats if item['lldp_neighbor_device'] != second_core_switch]

        # Create JSON representation
        network_tree = []
        added_switches = set()

        def add_item_to_tree(item):
            if item['lldp_neighbor_device'] not in added_switches and item['lldp_neighbor_device'] != second_core_switch:
                status = "true" if item in true_stats else "false"
                node = {
                    'name': item['lldp_neighbor_device'],
                    'status': status,
                    'children': []
                }
                added_switches.add(item['lldp_neighbor_device'])
                children_true = [x for x in true_stats if x['source_switch_hostname'] == item['lldp_neighbor_device']]
                children_false = [x for x in false_stats if x['source_switch_hostname'] == item['lldp_neighbor_device']]
                for child in children_true + children_false:
                    child_node = add_item_to_tree(child)
                    if child_node:
                        node['children'].append(child_node)
                return node
            return None

        # Add core switch
        if core_switch not in added_switches:
            network_tree.append(add_item_to_tree({'lldp_neighbor_device': core_switch, 'exists_in_master_switch_stats': True}))

        # Add children of core switch from both true_stats and false_stats
        core_children = [x for x in true_stats + false_stats if x['source_switch_hostname'] == core_switch]
        for item in core_children:
            child_node = add_item_to_tree(item)
            if child_node:
                network_tree.append(child_node)

        return network_tree
    else:
        return None

def setup_database():
    conn = psycopg2.connect(**db_params)
    conn.autocommit = True
    try:
        with conn.cursor() as cursor:
            # Create tables if they do not exist
            cursor.execute(create_master_table)
            cursor.execute(create_historical_switch_table)
            cursor.execute(create_historical_interface_table)
            
            print("Tables are set up successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
        print(traceback.format_exc())
    finally:
        conn.close()

def format_mac_address(mac):
    # Remove any non-hexadecimal characters
    mac = re.sub(r'[^0-9a-fA-F]', '', mac)
    # Convert to lower case
    mac = mac.lower()
    # Ensure it's 12 characters long
    if len(mac) != 12:
        raise ValueError("Invalid MAC address format")
    # Convert to e430.2250.abf3 format
    return f'{mac[0:4]}.{mac[4:8]}.{mac[8:12]}'

@app.route('/api/db/store_data', methods=['POST'])
def store_data():
    data = request.json
    
    switch_stats = data.get('switch_stats')
    interface_stats = data.get('interface_stats')
    platform = switch_stats.get('device_type')

    if not switch_stats or not interface_stats:
        return jsonify({"error": "Invalid data format"}), 400

    if not platform or len(platform) > 20:
        return jsonify({"error": "Platform is required and should be a string of up to 20 characters."}), 400
    conn = psycopg2.connect(**db_params)
    conn.autocommit = True
    try:
        with conn.cursor() as cursor:
            # Insert into master_switch_stats
            cursor.execute("""
                INSERT INTO master_switch_stats (hostname, ip_address, hardware, serial, mac_address, platform)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (hostname) DO UPDATE SET
                ip_address = EXCLUDED.ip_address,
                hardware = EXCLUDED.hardware,
                serial = EXCLUDED.serial,
                mac_address = EXCLUDED.mac_address,
                platform = EXCLUDED.platform
                RETURNING id;
            """, (switch_stats['hostname'], switch_stats['ip_address'], switch_stats['hardware'], switch_stats['serial'], switch_stats['mac_address'], switch_stats.get('device_type')))
            switch_id = cursor.fetchone()[0]
            
            # Insert into historical_switch_stats
            cursor.execute("""
                INSERT INTO historical_switch_stats (switch_id, uptime, total_power_usage)
                VALUES (%s, %s, %s);
            """, (switch_id, switch_stats['uptime'], switch_stats.get('total_power_usage')))
            
            # Insert into historical_interface_stats
            for interface in interface_stats:
                cursor.execute("""
                    INSERT INTO historical_interface_stats (switch_id, port, name, status, vlan_id, duplex, speed, type, mac_address, ip_address, switch_name, lldp_neighbor, lldp_neighbor_device, lldp_neighbor_mgmt_ip, poe_power_usage, poe_device, poe_class, delay, description, encapsulation, hardware_type, interface, last_input, last_output, last_output_hang, link_status, media_type, mtu, output_errors, output_packets, output_pps, output_rate, protocol_status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (switch_id, interface['port'], interface['name'], interface['status'], interface['vlan_id'], interface['duplex'], interface['speed'], interface['type'], interface['mac_address'], interface['ip_address'], interface['switch_name'], interface['lldp_neighbor'], interface['lldp_neighbor_device'], interface['lldp_neighbor_mgmt_ip'], interface.get('poe_power_usage'), interface.get('poe_device'), interface.get('poe_class'), interface.get('delay'), interface.get('description'), interface.get('encapsulation'), interface.get('hardware_type'), interface.get('interface'), interface.get('last_input'), interface.get('last_output'), interface.get('last_output_hang'), interface.get('link_status'), interface.get('media_type'), interface.get('mtu'), interface.get('output_errors'), interface.get('output_packets'), interface.get('output_pps'), interface.get('output_rate'), interface.get('protocol_status')))
            
        return jsonify({"message": "Data stored successfully"}), 201
    except Exception as e:
        print(f"An error occurred: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    finally:
        conn.close()

@app.route('/api/db/get_all_switches', methods=['GET'])
def get_all_switches():
    conn = psycopg2.connect(**db_params)
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM master_switch_stats;")
            switches = cursor.fetchall()
            switch_list = []
            for switch in switches:
                switch_list.append({
                    "id": switch[0],
                    "hostname": switch[1],
                    "ip_address": switch[2],
                    "hardware": switch[3],
                    "serial": switch[4],
                    "mac_address": switch[5],
                    "platform": switch[6]
                })
        return jsonify(switch_list), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    finally:
        conn.close()

@app.route('/api/db/get_latest_ports/<identifier>', methods=['GET'])
def get_latest_ports(identifier):
    conn = psycopg2.connect(**db_params)
    try:
        with conn.cursor() as cursor:
            # Check if the identifier is a hostname or an IP address
            cursor.execute("""
                SELECT id, hostname, ip_address FROM master_switch_stats
                WHERE hostname = %s OR ip_address = %s;
            """, (identifier, identifier))
            switch = cursor.fetchone()
            
            if not switch:
                return jsonify({"error": "Switch not found"}), 404
            
            switch_id = switch[0]
            switch_hostname = switch[1]

            cursor.execute("""
                SELECT DISTINCT ON (port) *
                FROM historical_interface_stats
                WHERE switch_id = %s
                ORDER BY port, timestamp DESC;
            """, (switch_id,))
            ports = cursor.fetchall()

            port_list = []
            for port in ports:
                port_list.append({
                    "id": port[0],
                    "switch_id": port[1],
                    "port": port[2],
                    "name": port[3],
                    "status": port[4],
                    "vlan_id": port[5],
                    "duplex": port[6],
                    "speed": port[7],
                    "type": port[8],
                    "fc_mode": port[9],
                    "mac_address": port[10],
                    "ip_address": port[11],
                    "switch_name": port[12],
                    "lldp_neighbor": port[13],
                    "lldp_neighbor_device": port[14],
                    "lldp_neighbor_mgmt_ip": port[15],
                    "poe_power_usage": port[16],
                    "poe_device": port[17],
                    "poe_class": port[18],
                    "delay": port[19],
                    "description": port[20],
                    "encapsulation": port[21],
                    "hardware_type": port[22],
                    "interface": port[23],
                    "last_input": port[24],
                    "last_output": port[25],
                    "last_output_hang": port[26],
                    "link_status": port[27],
                    "media_type": port[28],
                    "mtu": port[29],
                    "output_errors": port[30],
                    "output_packets": port[31],
                    "output_pps": port[32],
                    "output_rate": port[33],
                    "protocol_status": port[34],
                    "timestamp": port[35]
                })
        return jsonify(port_list), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    finally:
        conn.close()

@app.route('/api/db/get_switch/<identifier>', methods=['GET'])
def get_switch(identifier):
    conn = psycopg2.connect(**db_params)
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM master_switch_stats
                WHERE hostname = %s OR ip_address = %s;
            """, (identifier, identifier))
            switch = cursor.fetchone()
            
            if not switch:
                return jsonify({"error": "Switch not found"}), 404

            switch_data = {
                "id": switch[0],
                "hostname": switch[1],
                "ip_address": switch[2],
                "hardware": switch[3],
                "serial": switch[4],
                "mac_address": switch[5],
                "platform": switch[6]
            }

            # Get the latest uptime and total_power_usage data
            cursor.execute("""
                SELECT uptime, total_power_usage, timestamp FROM historical_switch_stats
                WHERE switch_id = %s
                ORDER BY timestamp DESC LIMIT 1;
            """, (switch_data["id"],))
            uptime_data = cursor.fetchone()
            if uptime_data:
                switch_data["latest_uptime"] = uptime_data[0]
                switch_data["total_power_usage"] = uptime_data[1]
                switch_data["uptime_timestamp"] = uptime_data[2]

        return jsonify(switch_data), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    finally:
        conn.close()
  
@app.route('/api/db/get_lldp_neighbors/<identifier>', methods=['GET'])
def get_lldp_neighbors(identifier):
    conn = psycopg2.connect(**db_params)
    try:
        with conn.cursor() as cursor:
            # Fetch all switches from master_switch_stats
            cursor.execute("SELECT id, hostname, ip_address FROM master_switch_stats")
            switches = cursor.fetchall()

            # Normalize the identifier to handle case-insensitivity

            # Find the switch by identifier
            identifier_short = identifier.split('.')[0]

            # Find the switch by identifier
            switch = next(
                (s for s in switches 
                 if s[1] == identifier or 
                    s[1].startswith(identifier_short + '.') or 
                    s[1].split('.')[0] == identifier_short or 
                    s[2] == identifier), 
                None
            )
            if not switch:
                return jsonify({"error": "Switch not found"}), 404

            switch_id = switch[0]
            switch_hostname = switch[1]

            cursor.execute("""
                SELECT DISTINCT ON (port) port, lldp_neighbor, lldp_neighbor_device, lldp_neighbor_mgmt_ip
                FROM historical_interface_stats
                WHERE switch_id = %s AND lldp_neighbor IS NOT NULL
                ORDER BY port, timestamp DESC;
            """, (switch_id,))
            lldp_neighbors = cursor.fetchall()

            neighbor_list = []
            for neighbor in lldp_neighbors:
                port = neighbor[0]
                lldp_neighbor = neighbor[1]
                lldp_neighbor_device = neighbor[2]
                lldp_neighbor_mgmt_ip = neighbor[3]

                # Skip entries with no LLDP information
                if not lldp_neighbor and not lldp_neighbor_device and not lldp_neighbor_mgmt_ip:
                    continue
                
                neighbor_switch = None
                if lldp_neighbor_device:
                    neighbor_device_lower = lldp_neighbor_device.split('.')[0].lower()
                    neighbor_switch = next(
                        (s for s in switches 
                         if s[1].lower().startswith(neighbor_device_lower)), 
                        None
                    )
                if not neighbor_switch and lldp_neighbor_mgmt_ip:
                    neighbor_switch = next((s for s in switches if s[2] == lldp_neighbor_mgmt_ip), None)
                
                neighbor_exists = neighbor_switch is not None
                neighbor_hostname = neighbor_switch[1] if neighbor_switch else lldp_neighbor_device.split('.')[0] if lldp_neighbor_device else ""

                # Get the port details on the neighbor switch if it exists
                connected_port_details = None
                if neighbor_exists:
                    cursor.execute("""
                        SELECT port
                        FROM historical_interface_stats
                        WHERE switch_id = %s AND lldp_neighbor_device LIKE %s
                        ORDER BY timestamp DESC LIMIT 1;
                    """, (neighbor_switch[0], f"%{switch_hostname.split('.')[0]}%"))
                    connected_port_details = cursor.fetchone()

                neighbor_list.append({
                    "source_switch_hostname": switch_hostname,
                    "source_port": port,
                    "lldp_neighbor": lldp_neighbor,
                    "lldp_neighbor_device": lldp_neighbor_device,
                    "lldp_neighbor_mgmt_ip": lldp_neighbor_mgmt_ip,
                    "exists_in_master_switch_stats": neighbor_exists,
                    "neighbor_switch_hostname": neighbor_hostname,
                    "neighbor_connected_port": connected_port_details[0] if connected_port_details else None
                })
        
        return jsonify(neighbor_list), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    finally:
        conn.close()

@app.route('/api/db/generate_network_tree/<ip_address>', methods=['GET'])
def generate_network_tree_route(ip_address):
    initial_url = f"http://127.0.0.1:5000/api/db/get_lldp_neighbors/{ip_address}"
    network_tree = generate_network_tree(initial_url)
    if network_tree is not None:
        return jsonify(network_tree), 200
    else:
        return jsonify({"error": "Failed to fetch initial data."}), 500

@app.route('/api/db/get_all_ports/<identifier>', methods=['GET'])
def get_all_ports(identifier):
    conn = psycopg2.connect(**db_params)
    try:
        with conn.cursor() as cursor:
            # Check if the identifier is a hostname or an IP address
            cursor.execute("""
                SELECT id, hostname, ip_address FROM master_switch_stats
                WHERE hostname = %s OR ip_address = %s;
            """, (identifier, identifier))
            switch = cursor.fetchone()
            
            if not switch:
                return jsonify({"error": "Switch not found"}), 404
            
            switch_id = switch[0]

            cursor.execute("""
                SELECT *
                FROM historical_interface_stats
                WHERE switch_id = %s
                ORDER BY timestamp ASC;
            """, (switch_id,))
            ports = cursor.fetchall()

            port_list = []
            for port in ports:
                port_list.append({
                    "id": port[0],
                    "switch_id": port[1],
                    "port": port[2],
                    "name": port[3],
                    "status": port[4],
                    "vlan_id": port[5],
                    "duplex": port[6],
                    "speed": port[7],
                    "type": port[8],
                    "fc_mode": port[9],
                    "mac_address": port[10],
                    "ip_address": port[11],
                    "switch_name": port[12],
                    "lldp_neighbor": port[13],
                    "lldp_neighbor_device": port[14],
                    "lldp_neighbor_mgmt_ip": port[15],
                    "poe_power_usage": port[16],
                    "poe_device": port[17],
                    "poe_class": port[18],
                    "delay": port[19],
                    "description": port[20],
                    "encapsulation": port[21],
                    "hardware_type": port[22],
                    "interface": port[23],
                    "last_input": port[24],
                    "last_output": port[25],
                    "last_output_hang": port[26],
                    "link_status": port[27],
                    "media_type": port[28],
                    "mtu": port[29],
                    "output_errors": port[30],
                    "output_packets": port[31],
                    "output_pps": port[32],
                    "output_rate": port[33],
                    "protocol_status": port[34],
                    "timestamp": port[35]
                })
        return jsonify(port_list), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    finally:
        conn.close()

@app.route('/api/db/get_ports_by_mac/<mac_address>', methods=['GET'])
def get_ports_by_mac(mac_address):
    try:
        formatted_mac = format_mac_address(mac_address)
    except ValueError as e:
        return jsonify({"error": "Invalid MAC address format"}), 400    
    conn = psycopg2.connect(**db_params)
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM historical_interface_stats
                WHERE mac_address = %s;
            """, (formatted_mac,))
            ports = cursor.fetchall()

            if not ports:
                return jsonify({"error": "MAC address not found"}), 404
            
            port_list = []
            for port in ports:
                port_list.append({
                    "id": port[0],
                    "switch_id": port[1],
                    "port": port[2],
                    "name": port[3],
                    "status": port[4],
                    "vlan_id": port[5],
                    "duplex": port[6],
                    "speed": port[7],
                    "type": port[8],
                    "fc_mode": port[9],
                    "mac_address": port[10],
                    "ip_address": port[11],
                    "switch_name": port[12],
                    "lldp_neighbor": port[13],
                    "lldp_neighbor_device": port[14],
                    "lldp_neighbor_mgmt_ip": port[15],
                    "poe_power_usage": port[16],  # Added POE power usage
                    "poe_device": port[17],  # Added POE device
                    "poe_class": port[18],  # Added POE class
                    "timestamp": port[19]
                })
        return jsonify(port_list), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        print(traceback.format_exc())
        return jsonify({"error": "An unexpected error occurred. Please try again later."}), 500
    finally:
        conn.close()

if __name__ == "__main__":
    setup_database()
    app.run()