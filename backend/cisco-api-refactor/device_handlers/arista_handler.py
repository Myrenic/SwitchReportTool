import os
import socket
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from netmiko import ConnectHandler
from netmiko.arista.arista import AristaSSH
from dotenv import load_dotenv
import requests
import textfsm
from ntc_templates.parse import parse_output

class CustomAristaSSH(AristaSSH):
    def session_preparation(self):
        self._test_channel_read()
        self.set_base_prompt()



def is_arista_device(host, port=22):
    # Implement Arista device detection logic
    pass

def run_arista_commands(host_data, commands):
    # host_data["device_type"] = "terminal_server"
    try:
        with CustomAristaSSH(**host_data) as net_connect:
            output = {}
            for command in commands:
                print(command)
                output[command] = net_connect.send_command(command, read_timeout=100)
            return output
    except Exception as e:
        print(f"Error executing Arista commands: {e}")
        return {}

def output_convertTo_Object(output, command, file):
    try:
        with open(file) as template_file:
            textfsm_parser = textfsm.TextFSM(template_file)
            parsed_data = textfsm_parser.ParseText(output[command])
            parsed_output = [dict(zip(textfsm_parser.header, row)) for row in parsed_data]
            return parsed_output
    except Exception as e:
        print(f"Error converting to object: {e}")
        return "error"

def to_lower_case(data):
    if isinstance(data, dict):
        return {to_lower_case(key): to_lower_case(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [to_lower_case(element) for element in data]
    elif isinstance(data, str):
        return data.lower()
    else:
        return data

def format_interfaces_to_json(output):
    out = output.split("[K[?1l")[0].split("[?1h=")[1]
    new = out.split("\n",2)[2]

    iface = (parse_output(platform="arista_eos", command="show interfaces status", data=new))

    updated_objects = []
    for obj in iface:
        new_obj = obj.copy()
        new_obj['type'] = new_obj['type'].strip()
        updated_objects.append(new_obj)
    return updated_objects

def process_arista_output(output, host_data):
    # Implement Arista output processing logic
    # Example structure:
    output["show interfaces status"] = output_convertTo_Object(output, "show interfaces status", "../../Templates/arista_show_interface_status.textfsm")
    output["show lldp neighbors detail"] = parse_output(platform="arista_eos", command="show lldp neighbors detail", data=output["show lldp neighbors detail"])
    output["show version"] = parse_output(platform="arista_eos", command="show version", data=output["show version"])
    output["show mac address-table"] = parse_output(platform="cisco_ios", command="show mac address-table", data=(output["show mac address-table"].split("Multicast Mac Address Table")[0]))
    output["show arp"] = parse_output(platform="arista_eos", command="show ip arp", data=output["show arp"].split("[?1h=")[1])
    output["show hostname"] = output["show hostname"].split("\n")[1].split(": ")[1]
    interfaces_status = to_lower_case(output["show interfaces status"])
    mac_address_table = output["show mac address-table"]
    switch_version = output["show version"][0]
    arp_table = output["show arp"]
    # output["show lldp neighbors detail"]


    switch_stats = {
        "uptime": "N/A",
        "hostname": output["show hostname"],
        "ip_address": host_data['host'],
        "hardware": [switch_version['model']] if isinstance(switch_version['model'], str) else switch_version['model'],
        "serial": [switch_version['serial_number']] if isinstance(switch_version['serial_number'], str) else switch_version['serial_number'],
        "mac_address": [switch_version['sys_mac']] if isinstance(switch_version['sys_mac'], str) else switch_version['sys_mac'],
        "device_type": "arista_eos"
    }

    # interface_stats = []
    print("Hii!2")
    # Populate interface_stats based on the output

    return {"switch_stats": switch_stats, "interface_stats": "interface_stats", "output": output}