from flask import Flask, request, jsonify
import re

app = Flask(__name__)

EXAMPLE_CONFIG = """
Port      Name               Status       Vlan       Duplex  Speed   Type
Gi1/0/1                     connected    10         full    1000    10/100/1000BaseTX
Gi1/0/2                     notconnect   20         auto    auto    10/100/1000BaseTX
Gi1/0/3                     connected    30         full    1000    10/100/1000BaseTX
Gi1/0/4                     err-disabled 40         full    1000    10/100/1000BaseTX
Gi1/0/5                     disabled     50         auto    auto    10/100/1000BaseTX
Te1/1/1                     connected    trunk      full    10000   10GBase-SR
Te1/1/2                     notconnect   trunk      auto    auto    10GBase-SR
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

@app.route('/config', methods=['GET'])
def get_config():
    switch_name = request.args.get("switch")
    if not switch_name:
        return jsonify({"error": "No switch name provided"}), 400
    
    parsed_data = parse_cisco_output(EXAMPLE_CONFIG)
    return jsonify({"switch": switch_name, "config": parsed_data})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
