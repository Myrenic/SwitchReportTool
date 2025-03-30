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
        print(f"Error connecting to {host}: {e}")
        print(traceback.format_exc())
        return False

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
        print(traceback.format_exc())
        return {}