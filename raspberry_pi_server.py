# historic_overlay_server.py

import os, io, time, base64
from PIL import Image, ImageDraw
from flask import Flask, request, jsonify
from google.cloud import vision_v1 as vision
from pyngrok import ngrok, conf
import moondream as md
from dotenv import load_dotenv

# ─── LOAD SECRETS ─────────────────────────────────────────────────────
load_dotenv()  # Load from .env

# Env vars
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
MOONDREAM_API_KEY = os.getenv("MOONDREAM_API_KEY")
conf.get_default().auth_token = os.getenv("NGROK_AUTHTOKEN")

# ─── INIT SERVICES ────────────────────────────────────────────────────
vision_client = vision.ImageAnnotatorClient()
moondream_model = md.vl(api_key=MOONDREAM_API_KEY)
app = Flask(__name__)

# ─── PROCESS ENDPOINT ─────────────────────────────────────────────────
@app.route("/process", methods=["POST"])
def process_image():
    data = request.get_json()
    if not data or "image" not in data or "tasks" not in data:
        return jsonify({"error": "Missing 'image' or 'tasks'"}), 400

    try:
        image_data = base64.b64decode(data["image"])
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        print("✅ Image decoded successfully")
    except Exception as e:
        return jsonify({"error": f"Invalid image: {str(e)}"}), 400

    tasks = data["tasks"]
    results = {}

    if "object_detection" in tasks:
        detect_class = data.get("detect_class", "object")
        print(f"🔍 Detecting class: {detect_class}")
        try:
            boxes = moondream_model.detect(image, detect_class)["objects"]
            bboxes = []
            for box in boxes:
                bboxes.append({
                    "label": box.get("label", detect_class),
                    "x_min": box["x_min"],
                    "y_min": box["y_min"],
                    "x_max": box["x_max"],
                    "y_max": box["y_max"]
                })
            results["bounding_boxes"] = bboxes

            # Draw and save bounding boxes
            draw = ImageDraw.Draw(image)
            for box in bboxes:
                x1 = int(box["x_min"] * image.width)
                y1 = int(box["y_min"] * image.height)
                x2 = int(box["x_max"] * image.width)
                y2 = int(box["y_max"] * image.height)
                draw.rectangle([x1, y1, x2, y2], outline="red", width=3)
                draw.text((x1, y1 - 10), box["label"], fill="red")
            image.save("debug_output.jpg")
            print("📸 Saved debug image with bounding boxes")

        except Exception as e:
            results["detection_error"] = str(e)

    if "vqa" in tasks:
        question = data.get("question", "What is in the image?")
        print(f"🗣️ VQA question: {question}")
        try:
            results["vqa_answer"] = moondream_model.query(image, question)["answer"]
        except Exception as e:
            results["vqa_error"] = str(e)

    if "landmark_detection" in tasks:
        print("🗺️ Running landmark detection...")
        try:
            buf = io.BytesIO()
            image.save(buf, format="JPEG")
            vision_image = vision.Image(content=buf.getvalue())
            lm_result = vision_client.landmark_detection(image=vision_image)
            landmarks = []
            for lm in lm_result.landmark_annotations:
                coord = lm.locations[0].lat_lng
                landmarks.append({
                    "name": lm.description,
                    "latitude": coord.latitude,
                    "longitude": coord.longitude
                })
            results["landmarks"] = landmarks
        except Exception as e:
            results["landmark_error"] = str(e)

    return jsonify(results)

# ─── SERVER STARTUP ────────────────────────────────────────────────────
if __name__ == "__main__":
    try:
        print("🛑 Killing old tunnels...")
        ngrok.kill()
        print("✅ Starting Flask server...")
        public_url = ngrok.connect(addr=5000)
        print(f"🌐 Public API Endpoint: {public_url}/process")
        app.run(host="0.0.0.0", port=5000)
    except Exception as e:
        print(f"❌ Server failed: {e}")
