from flask import Blueprint, request, jsonify
from utils import is_cisco_device, is_valid_ip, parse_cisco_output, EXAMPLE_CONFIG

bp = Blueprint('config', __name__)

@bp.route('/config', methods=['GET'])
def get_config():
    ip = request.args.get("ip")
    if not is_valid_ip(ip):
        return jsonify({"error": "Invalid IP address"}), 400

    is_cisco = is_cisco_device(ip)
    if not is_cisco:
        return jsonify({"is_cisco": is_cisco})

    parsed_data = parse_cisco_output(EXAMPLE_CONFIG)
    return jsonify({"is_cisco": is_cisco, "config": parsed_data})
