# Switch Report Tool

**Warning**: This project is in **very early development**. The functionality and structure may change frequently, and it's not yet feature-complete. Use at your own risk!

## Overview

This tool allows you to check if a device is a Cisco switch and retrieve a mocked configuration report. The configuration output is parsed and returned as structured JSON data. Currently, only basic functionality is implemented.

## Features:

- **Check if a device at a given IP address is a Cisco switch**.
- **Retrieve a configuration report of a Cisco switch**.

##to do:

- implement secure api endpoints, jwt token or passwords.
- implement docker compose with https
- only allow creation of new switch by trusted people. 
- only allow switches from certain subnets or hardcode every switch to prevent honeypot cred leak
- make all components include mui style.
- add how long port is up or down for in table
- show switch uptime in switch data conponent
- implement windows credentials verification
- make the switch update script run on interval? not sure about this one yet.
- add support for arista's
- add find all lldp neighbors page with some nice ui.
- improve speed of apis, redis?
