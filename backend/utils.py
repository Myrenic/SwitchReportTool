import socket
import re
import ipaddress
import os

EXAMPLE_CONFIG = """
Port       Name              Status              Vlan  Duplex  Speed  Type
Gi1/0/1    coffee_machine    up                  12    full    1000   10/100/1000BaseTX
Gi1/0/2    server            down                35    auto    auto   10/100/1000BaseTX
Gi1/0/3    pc                up                  28    full    1000   10/100/1000BaseTX
Gi1/0/4    printer           err-disabled        43    full    1000   10/100/1000BaseTX
Gi1/0/5    laptop            administratively down  56  auto    auto   10/100/1000BaseTX
Gi1/0/6    switch            up                  19    full    1000   10/100/1000BaseTX
Gi1/0/7    router            down                64    auto    auto   10/100/1000BaseTX
Gi1/0/8    access_point      up                  91    full    1000   10/100/1000BaseTX
Gi1/0/9    firewall          err-disabled        72    full    1000   10/100/1000BaseTX
Gi1/0/10   storage           administratively down  81  auto    auto   10/100/1000BaseTX
Gi1/0/11   camera            up                  53    full    1000   10/100/1000BaseTX
Gi1/0/12   monitor           down                26    auto    auto   10/100/1000BaseTX
Gi1/0/13   tablet            up                  38    full    1000   10/100/1000BaseTX
Gi1/0/14   kiosk             err-disabled        49    full    1000   10/100/1000BaseTX
Gi1/0/15   guest_device      administratively down  67  auto    auto   10/100/1000BaseTX
Gi1/0/16   monitor_2         up                  14    full    1000   10/100/1000BaseTX
Gi1/0/17   smart_tv          down                82    auto    auto   10/100/1000BaseTX
Gi1/0/18   desktop           up                  22    full    1000   10/100/1000BaseTX
Gi1/0/19   projector         err-disabled        29    full    1000   10/100/1000BaseTX
Gi1/0/20   console           administratively down  60  auto    auto   10/100/1000BaseTX
Gi1/0/21   webcam            up                  77    full    1000   10/100/1000BaseTX
Gi1/0/22   scanner           down                48    auto    auto   10/100/1000BaseTX
Gi1/0/23   switch_2          up                  66    full    1000   10/100/1000BaseTX
Gi1/0/24   backup_device     err-disabled        93    full    1000   10/100/1000BaseTX

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

def is_ip_in_subnet(ip):
    """Check if the given IP address is in any of the subnets defined in .env."""
    subnets = os.getenv("TRUSTED_SUBNETS", "").split(",")
    try:
        ip_obj = ipaddress.ip_address(ip)
        for subnet in subnets:
            if ip_obj in ipaddress.ip_network(subnet.strip(), strict=False):
                return True
        return False
    except ValueError:
        return False  # Invalid IP address