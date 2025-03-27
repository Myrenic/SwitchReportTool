from flask import Blueprint, request, jsonify
from utils import is_cisco_device, is_valid_ip, parse_cisco_output, EXAMPLE_CONFIG, is_ip_in_subnet

bp = Blueprint('port_config', __name__)

@bp.route('/port_config', methods=['GET'])
def get_config():
    ip = request.args.get("ip")
    if not is_valid_ip(ip):
        return jsonify({"error": "Invalid IP address"}), 400

    if not is_ip_in_subnet(ip):
        return jsonify({"error": "Not a trusted IP address"}), 400

    is_cisco = is_cisco_device(ip)
    if not is_cisco:
        return jsonify({"is_cisco": is_cisco})

    parsed_data = parse_cisco_output(EXAMPLE_CONFIG)
    return jsonify({"is_cisco": is_cisco, "config": parsed_data})
