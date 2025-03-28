from flask import Flask, request, jsonify
import psycopg2
from psycopg2 import sql
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# Database connection details
db_params = {
    'dbname': 'postgres',
    'user': 'postgres',
    'password': 'Test12345TestTest',
    'host': '10.115.202.50',
    'port': '5432'
}

# SQL commands for creating tables
create_master_table = """
CREATE TABLE IF NOT EXISTS master_switch_stats (
    id SERIAL PRIMARY KEY,
    hostname VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(50),
    hardware VARCHAR(255)[],
    serial VARCHAR(255)[],
    mac_address VARCHAR(255)[]
);
"""

create_historical_switch_table = """
CREATE TABLE IF NOT EXISTS historical_switch_stats (
    id SERIAL PRIMARY KEY,
    switch_id INTEGER REFERENCES master_switch_stats(id),
    uptime VARCHAR(255),
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
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""



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
    finally:
        conn.close()

@app.route('/store_data', methods=['POST'])
def store_data():
    data = request.json
    

    switch_stats = data.get('switch_stats')
    interface_stats = data.get('interface_stats')
    
    if not switch_stats or not interface_stats:
        return jsonify({"error": "Invalid data format"}), 400

    conn = psycopg2.connect(**db_params)
    conn.autocommit = True
    try:
        with conn.cursor() as cursor:
            # Insert into master_switch_stats
            cursor.execute("""
                INSERT INTO master_switch_stats (hostname, ip_address, hardware, serial, mac_address)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (hostname) DO UPDATE SET
                ip_address = EXCLUDED.ip_address,
                hardware = EXCLUDED.hardware,
                serial = EXCLUDED.serial,
                mac_address = EXCLUDED.mac_address
                RETURNING id;
            """, (switch_stats['hostname'], switch_stats['ip_address'], switch_stats['hardware'], switch_stats['serial'], switch_stats['mac_address']))
            switch_id = cursor.fetchone()[0]
            
            # Insert into historical_switch_stats
            cursor.execute("""
                INSERT INTO historical_switch_stats (switch_id, uptime)
                VALUES (%s, %s);
            """, (switch_id, switch_stats['uptime']))
            
            # Insert into historical_interface_stats
            for interface in interface_stats:
                cursor.execute("""
                    INSERT INTO historical_interface_stats (switch_id, port, name, status, vlan_id, duplex, speed, type, fc_mode, mac_address, ip_address, switch_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (switch_id, interface['port'], interface['name'], interface['status'], interface['vlan_id'], interface['duplex'], interface['speed'], interface['type'], interface['fc_mode'], interface['mac_address'], interface['ip_address'], interface['switch_name']))
            
        return jsonify({"message": "Data stored successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/get_all_switches', methods=['GET'])
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
                    "mac_address": switch[5]
                })
        return jsonify(switch_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/get_latest_ports/<identifier>', methods=['GET'])
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
                    "timestamp": port[13]
                })
        return jsonify(port_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/get_switch/<identifier>', methods=['GET'])
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
                "mac_address": switch[5]
            }
        return jsonify(switch_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.route('/get_all_ports/<identifier>', methods=['GET'])
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
                    "timestamp": port[13]
                })
        return jsonify(port_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    setup_database()
    app.run(host='0.0.0.0', port=5000)
