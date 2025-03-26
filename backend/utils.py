import socket
import re
import ipaddress

EXAMPLE_CONFIG = """
Port      Name               Status       Vlan       Duplex  Speed   Type
Gi1/0/1   connected          10           full      1000    10/100/1000BaseTX
Gi1/0/2   notconnect         20           auto      auto    10/100/1000BaseTX
Gi1/0/3   connected          30           full      1000    10/100/1000BaseTX
Gi1/0/4   err-disabled       40           full      1000    10/100/1000BaseTX
Gi1/0/5   disabled           50           auto      auto    10/100/1000BaseTX
Te1/1/1   connected          trunk       full      10000   10GBase-SR
Te1/1/2   notconnect         trunk       auto      auto    10GBase-SR
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

def is_cisco_device(ip):
    try:
        sock = socket.create_connection((ip, 22), timeout=2)
        sock.settimeout(2)

        banner = sock.recv(1024).decode('utf-8', errors='ignore')
        sock.close()
        return "Cisco" in banner
    except Exception:
        return False

def is_valid_ip(ip):
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False
