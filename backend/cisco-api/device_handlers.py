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
        return (f"Not a cisco device")
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