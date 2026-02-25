from flask import Flask
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)

# Enable CORS for a specific origin
CORS(app)

# Import routes after app initialization
from app import routes