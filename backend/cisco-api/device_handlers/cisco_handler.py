import socket
import traceback
from netmiko import ConnectHandler

def is_cisco_device(host, port=22):
    try:
        sock = socket.create_connection((host, port), timeout=2)
        banner = sock.recv(1024).decode('utf-8', errors='ignore')
        sock.close()
        return "Cisco" in banner
    except Exception as e:
        print(f"Error connecting to {host}")
        return False

def run_cisco_commands(host_data, commands):
    output = {}
    if not is_cisco_device(host_data['host']):
        return "Not a Cisco device"
    try:
        net_connect = ConnectHandler(**host_data)
        for command in commands:
            try:
                output[command] = net_connect.send_command(command, use_textfsm=True)
            except Exception as e:
                print(f"Error executing command {command}: {e}")
                output[command] = "N/A"
    except Exception as e:
        print(f"Connection error: {e}")
        output = {command: "N/A" for command in commands}
    finally:
        net_connect.disconnect()
    return output

def process_cisco_output(output, host_data):
    interfaces_status = output.get("show interfaces status", [])
    mac_address_table = output.get("show mac address-table", [])
    switch_version = output.get("show version", [{}])[0]
    arp_table = output.get("show arp", [])
    lldp_neighbors = output.get("show lldp neighbors detail", [])

    if isinstance(lldp_neighbors, str):
        lldp_neighbors = []

    switch_stats = {
        "uptime": switch_version.get('uptime', 'N/A'),
        "hostname": switch_version.get('hostname', 'N/A'),
        "ip_address": host_data['host'],
        "hardware": switch_version.get('hardware', 'N/A'),
        "serial": switch_version.get('serial', 'N/A'),
        "mac_address": switch_version.get('mac_address', 'N/A'),
        "device_type": "cisco_ios"
    }

    interface_stats = []

    for port_info in interfaces_status:
        combined_entry = port_info.copy()
        port = port_info.get('port', 'N/A')

        mac_info = next((mac for mac in mac_address_table if port in mac.get('destination_port', [])), None)
        if mac_info:
            combined_entry['mac_address'] = mac_info.get('destination_address', 'N/A')

            arp_info = next((arp for arp in arp_table if arp.get('hardware_address') == mac_info.get('destination_address')), None)
            if arp_info:
                combined_entry['ip_address'] = arp_info.get('address', 'N/A')
            else:
                combined_entry['ip_address'] = 'N/A'
        else:
            combined_entry['mac_address'] = 'N/A'
            combined_entry['ip_address'] = 'N/A'

        lldp_info = next((lldp for lldp in lldp_neighbors if lldp.get('local_interface') == port), None)
        if lldp_info:
            combined_entry['lldp_neighbor'] = lldp_info.get('neighbor_interface', '')
            combined_entry['lldp_neighbor_device'] = lldp_info.get('neighbor_name') or lldp_info.get('chassis_id', '')
            combined_entry['lldp_neighbor_mgmt_ip'] = lldp_info.get('mgmt_address', '')
        else:
            combined_entry['lldp_neighbor'] = ''
            combined_entry['lldp_neighbor_device'] = ''
            combined_entry['lldp_neighbor_mgmt_ip'] = ''

        combined_entry['switch_name'] = switch_version.get('hostname', 'N/A')

        interface_stats.append(combined_entry)

    return {"switch_stats": switch_stats, "interface_stats": interface_stats}