import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from routes import check_device, config

load_dotenv()

API_SECRET_KEY = os.getenv("API_SECRET_KEY")

app = Flask(__name__)

# Get allowed origins from .env
allowed_origins = os.getenv("CORS_ORIGINS", "").split(",")

# Apply CORS globally for all routes
CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)


app.register_blueprint(check_device.bp)
app.register_blueprint(config.bp)

@app.before_request
def require_api_key():
    if request.path.startswith('/check_device') or request.path.startswith('/config'):
        api_key = request.headers.get("Authorization")
        if api_key != f"Bearer {API_SECRET_KEY}":
            return jsonify({"error": "Unauthorized"}), 403

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
