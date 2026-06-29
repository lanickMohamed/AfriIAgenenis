from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from fonspeacker import parler

app = Flask(__name__)
CORS(app)

@app.route("/speak", methods=["POST"])
def speak():
    data  = request.get_json(force=True)
    texte = data.get("text", "").strip()

    if not texte:
        return jsonify({"error": "text vide"}), 400

    mp3 = parler(texte)
    return send_file(mp3, mimetype="audio/mpeg")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)