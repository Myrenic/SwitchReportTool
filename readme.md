# Switch Report Tool
Warning: This project is in very early development. The functionality and structure may change frequently, and it's not yet feature-complete. Use at your own risk!

## Overview
This tool allows you to check if a device is a Cisco switch and retrieve configuration report. The configuration output is parsed and returned as structured JSON data. Currently, only basic functionality is implemented like:

- See interface config
- Find where mac is used on which port
- Add new switch to db

## Docker Compose
```docker
version: '3.8'

services:
  caddy:
    image: caddy:latest
    container_name: switchreporttool_caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /home/mtuntelder/switchreporttool/Caddyfile:/etc/caddy/Caddyfile

  frontend:
    image: ghcr.io/myrenic/switchreporttool:frontend-latest
    container_name: switchreporttool_frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - VITE_REACT_APP_DATABASE_API_URL=${VITE_REACT_APP_DATABASE_API_URL}
      - VITE_REACT_APP_CISCO_API_URL=${VITE_REACT_APP_CISCO_API_URL}
      
  backend-cisco:
    image: ghcr.io/myrenic/switchreporttool:backend-cisco-latest
    container_name: switchreporttool_backend_cisco
    restart: unless-stopped
    environment:
      - API_TO_DB=http://backend-db:5000
      - HOST_USERNAME=${HOST_USERNAME}
      - HOST_PASSWORD=${HOST_PASSWORD}
      - API_PASSWORD=${CISCO_API_PASSWORD}

  backend-db:
    image: ghcr.io/myrenic/switchreporttool:backend-db-latest
    container_name: switchreporttool_backend_db
    restart: unless-stopped
    environment:
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}

networks:
  default:
    driver: bridge
```
How to Run
Ensure you have Docker and Docker Compose installed.

Create a .env file in the same directory as your docker-compose.yml with the necessary environment variables:
```
VITE_REACT_APP_DATABASE_API_URL=your_database_api_url #https from caddy
VITE_REACT_APP_CISCO_API_URL=your_cisco_api_url #https from caddy
HOST_USERNAME=your_host_username
HOST_PASSWORD=your_host_password
CISCO_API_PASSWORD=your_cisco_api_password
DB_PASSWORD=your_db_password
DB_HOST=your_db_host # postgres! just spin up a new container and point this to it.
DB_PORT=your_db_port
```
