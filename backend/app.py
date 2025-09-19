from flask import Flask, Response, jsonify
import cv2
from detection import detect
from alerts import send_alert

app = Flask(__name__)

last_alert = {"weapon": None, "confidence": 0}

def gen_frames():
    global last_alert
    cap = cv2.VideoCapture(0)
    while True:
        success, frame = cap.read()
        if not success:
            break
        detections, annotated_frame = detect(frame)

        # Check if weapon detected
        for det in detections:
            if det["label"] in ["knife", "gun"]:
                if det["confidence"] > 0.6:  # threshold
                    last_alert = {"weapon": det["label"], "confidence": det["confidence"]}
                    send_alert(f"⚠ Weapon detected: {det['label']} (conf {det['confidence']:.2f})")

        _, buffer = cv2.imencode('.jpg', annotated_frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route("/video_feed")
def video_feed():
    return Response(gen_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/alerts")
def alerts():
    return jsonify(last_alert)

if __name__ == "__main__":
    app.run(debug=True)
