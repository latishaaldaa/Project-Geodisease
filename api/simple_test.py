from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "Backend API is running!", "status": "OK"})

@app.route('/api/')
def api_home():
    return jsonify({"message": "API endpoint is working!", "status": "OK"})

@app.route('/api/test')
def test():
    return jsonify({"message": "Test endpoint", "data": "Success"})

# Export app untuk Vercel
if __name__ == '__main__':
    app.run(debug=True)
