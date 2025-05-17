from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from chatbot_logic import get_chat_response
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_input = data.get("message", "")
    try:
        reply = get_chat_response(user_input)
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": f"❌ Error: {str(e)}"})

@app.route('/resume', methods=['GET'])
def download_resume():
    return send_from_directory(
        directory=os.path.join(app.root_path, 'static/files'),
        path='Niraj.pdf',
        as_attachment=False
    )

if __name__ == '__main__':
    app.run(debug=True)
