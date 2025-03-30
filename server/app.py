from flask import Flask,jsonify
from mongoengine import connect
from flask_cors import CORS

app = Flask(__name__)

@app.route('/', methods=['GET'])
def greeting():
    """
    Renders the home page with the 'FLASK_ENV' environment variable.
    """
    return jsonify({'user':'hello world'})

CORS(app, resources={r"/*": {"origins": 'http://localhost:3000/*'}})

# Connect to MongoDB
mongodb_uri = ""
connect(host=mongodb_uri)

if __name__ == "__main__":
    """
    Start Flask app in debug mode.
    """
    app.run(debug=True)