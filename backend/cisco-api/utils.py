import os
import requests
import traceback

def post_to_api(url, data):
    try:
        response = requests.post(url, json=data, headers={"Content-Type": "application/json"})
        if response.status_code == 201:
            print(f"Successfully posted to {url}")
        else:
            print(f"Failed to post to {url}: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error posting to API: {e}")
        print(traceback.format_exc())

def switch_exists(ip_address):
    api_url = os.getenv("API_TO_DB") + f"/api/db/get_switch/{ip_address}"
    try:
        response = requests.get(api_url)
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error checking switch existence: {e}")
        print(traceback.format_exc())
        return False