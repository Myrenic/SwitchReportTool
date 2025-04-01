import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from routes import initialize_routes

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

initialize_routes(app)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)