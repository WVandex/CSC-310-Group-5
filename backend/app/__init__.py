from flask import Flask
from flask_cors import CORS

# Initialize the Flask application
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing
CORS(app)

# Import routes after app initialization to prevent circular imports
from app import routes