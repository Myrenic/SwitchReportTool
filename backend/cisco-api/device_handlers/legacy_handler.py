import requests
from bs4 import BeautifulSoup
import json
import traceback

def fetch_legacy_data(ip, deaddays=14):
    url = "http://10.48.106.148/cgi-bin/adhocswitchreporter.pl"
    payload = f"ip={ip}&deaddays={deaddays}"
    
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,nl;q=0.7",
        "Cache-Control": "no-cache",
        "DNT": "1",
        "Origin": "http://10.48.106.148",
        "Pragma": "no-cache",
        "Referer": "http://10.48.106.148/cgi-bin/adhocswitchselect.pl",
        "Upgrade-Insecure-Requests": "1",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        response = requests.post(url, data=payload, headers=headers)
        response.raise_for_status()  # Ensure we catch HTTP errors
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch data from legacy system: {e}")

    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Extract hostname from the h1 tag
    hostname_tag = soup.find('h1')
    fqdn = hostname_tag.text.split(":")[1].strip() if hostname_tag else 'Unknown'
    uptime_tag = soup.find('h2')
    uptime = uptime_tag.text.split(":")[1].strip() if uptime_tag else 'Unknown'

    hostname = fqdn.split('.')[0] if '.' in fqdn else fqdn

    tables = soup.find_all('table')
    if len(tables) < 2:
        raise ValueError("Error: Less than 2 tables found in the HTML response.")
    
    table = tables[1]
    table_data = []
    for row in table.find_all('tr'):
        columns = row.find_all('td')
        if columns:
            table_data.append([column.text.strip() for column in columns])
    
    return hostname, table_data, uptime, fqdn

def process_legacy_output(hostname, table_data, host_data, uptime, fqdn):
    switch_stats = {
        "hostname": hostname,
        "ip_address": host_data['host'],
        "device_type": "legacy",
        "uptime": uptime,
        "fqdn": fqdn,
    }
    
    interface_stats = []
    
    for row in table_data:
        if len(row) < 7:
            continue
        interface_stats.append({
            "port": row[0],
            "name": row[1],
            "status": row[2],
            "timestamp_last_status_update": row[3],
            "vlan_id": row[4],
            "speed": row[6],
            "switch_name": switch_stats['hostname'],
        })
    return {"switch_stats": switch_stats, "interface_stats": interface_stats}