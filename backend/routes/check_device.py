from flask import Blueprint, request, jsonify
from utils import is_cisco_device, is_valid_ip, is_ip_in_subnet

bp = Blueprint('check_device', __name__)

@bp.route('/check_device', methods=['GET'])
def check_device():
    ip = request.args.get("ip")
    if not ip:
        return jsonify({"error": "No IP address provided"}), 400

    if not is_ip_in_subnet(ip):
        return jsonify({"error": "Not a trusted IP address"}), 400

    if not is_valid_ip(ip):
        return jsonify({"error": "Invalid IP address"}), 400

    is_cisco = is_cisco_device(ip)
    return jsonify({"ip": ip, "is_cisco": is_cisco})
