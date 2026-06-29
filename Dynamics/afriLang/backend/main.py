from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from fonspeacker import parler
import os


app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "ok", "service": "afriLang TTS"})

@app.route("/speak", methods=["POST"])
def speak():
    data  = request.get_json(force=True)
    texte = data.get("text", "").strip()

    if not texte:
        return jsonify({"error": "text vide"}), 400

    mp3 = parler(texte)
    return send_file(mp3, mimetype="audio/mpeg")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))
    app.run(host="0.0.0.0", port=port, debug=False)