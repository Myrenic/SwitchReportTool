import json
import requests
from collections import defaultdict

# Function to fetch data from the API
def fetch_data(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch data from {url}: {response.status_code}")
        return None

# Initial API URL
initial_url = "http://127.0.0.1:5000/api/db/get_lldp_neighbors/10.115.193.253"

# Fetch the initial API response
data = fetch_data(initial_url)

if data:
    true_stats = []
    false_stats = []
    processed_hostnames = set()  # Set to keep track of processed IPs

    def process_item(item):
        # Process FQDN to hostname
        if 'lldp_neighbor_device' in item and item['lldp_neighbor_device']:
            fqdn = item['lldp_neighbor_device']
            item['lldp_neighbor_device'] = fqdn.split('.')[0]  # Take the first part before the dot

        # Separate items based on exists_in_master_switch_stats
        if item['exists_in_master_switch_stats']:
            true_stats.append(item)
        else:
            false_stats.append(item)

        # Fetch LLDP neighbors if not already processed
        neighbor_hostname = item.get('neighbor_switch_hostname')
        if neighbor_hostname:
            neighbor_hostname = neighbor_hostname.split('.')[0]  # Normalize hostname
        if neighbor_hostname and neighbor_hostname not in processed_hostnames:
            processed_hostnames.add(neighbor_hostname)
            if item.get('exists_in_master_switch_stats'):
                neighbor_url = f"http://127.0.0.1:5000/api/db/get_lldp_neighbors/{neighbor_hostname}"
                neighbor_data = fetch_data(neighbor_url)
                if neighbor_data:
                    for neighbor in neighbor_data:
                        process_item(neighbor)

    # Process the initial data
    for item in data:
        process_item(item)

    # Find the core switch in the true_stats list
    link_count = defaultdict(int)

    for item in true_stats:
        if 'lldp_neighbor_device' in item:
            link_count[item['lldp_neighbor_device']] += 1

    core_switch = max(link_count, key=link_count.get)

    # Check for the second core switch
    second_core_switch = None
    if core_switch.endswith('1'):
        potential_second_core = core_switch[:-1] + '2'
        # Check in true_stats and false_stats
        for item in true_stats + false_stats:
            if item.get('lldp_neighbor_device') == potential_second_core:
                second_core_switch = potential_second_core
                break
    elif core_switch.endswith('2'):
        potential_second_core = core_switch[:-1] + '1'
        for item in true_stats + false_stats:
            if item.get('lldp_neighbor_device') == potential_second_core:
                second_core_switch = potential_second_core
                break

     # Create JSON representation
    network_tree = []
    added_switches = set()

    def add_item_to_tree(item):
        if item['lldp_neighbor_device'] not in added_switches:
            status = "true" if item in true_stats else "false"
            node = {
                'name': item['lldp_neighbor_device'],
                'status': status,
                'children': []
            }
            added_switches.add(item['lldp_neighbor_device'])
            children_true = [x for x in true_stats if x['source_switch_hostname'] == item['lldp_neighbor_device']]
            children_false = [x for x in false_stats if x['source_switch_hostname'] == item['lldp_neighbor_device']]
            for child in children_true + children_false:
                child_node = add_item_to_tree(child)
                if child_node:
                    node['children'].append(child_node)
            return node
        return None

    # Add core switches
    if core_switch not in added_switches:
        network_tree.append(add_item_to_tree({'lldp_neighbor_device': core_switch, 'exists_in_master_switch_stats': True}))
    if second_core_switch and second_core_switch not in added_switches:
        network_tree.append(add_item_to_tree({'lldp_neighbor_device': second_core_switch, 'exists_in_master_switch_stats': True}))

    # Add children of core switches from both true_stats and false_stats
    core_children = [x for x in true_stats + false_stats if x['source_switch_hostname'] in {core_switch, second_core_switch}]
    for item in core_children:
        child_node = add_item_to_tree(item)
        if child_node:
            network_tree.append(child_node)

    # Output the JSON
    print(json.dumps(network_tree, indent=4))

else:
    print("Failed to fetch initial data.")