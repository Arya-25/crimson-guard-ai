from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
from detection import detect
from alerts import send_alert
import json
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Alert storage
alerts_db = []
last_alert = {"weapon": None, "confidence": 0}

def gen_frames():
    global last_alert, alerts_db
    cap = cv2.VideoCapture(0)
    
    while True:
        success, frame = cap.read()
        if not success:
            break
            
        detections, annotated_frame = detect(frame)

        # Check if weapon detected
        for det in detections:
            if det["label"] in ["knife", "gun", "rifle", "pistol"]:
                if det["confidence"] > 0.6:  # threshold
                    # Create new alert matching frontend interface
                    new_alert = {
                        "id": str(uuid.uuid4()),
                        "timestamp": datetime.now().isoformat(),
                        "camera": "Primary Webcam",
                        "weapon": det["label"],
                        "confidence": det["confidence"],
                        "severity": "critical" if det["confidence"] > 0.8 else "warning",
                        "location": "Local Device",
                        "status": "pending"
                    }
                    
                    # Add to alerts database
                    alerts_db.insert(0, new_alert)
                    
                    # Update last alert
                    last_alert = {"weapon": det["label"], "confidence": det["confidence"]}
                    
                    # Send SMS alert
                    try:
                        send_alert(f"⚠ {det['label'].upper()} detected! Confidence: {det['confidence']:.2f}")
                        new_alert["status"] = "sent"
                    except Exception as e:
                        print(f"Failed to send SMS: {e}")

        _, buffer = cv2.imencode('.jpg', annotated_frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route("/video_feed")
def video_feed():
    return Response(gen_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/alerts")
def get_alerts():
    """Get all alerts with optional filtering"""
    return jsonify(alerts_db)

@app.route("/alerts/<alert_id>", methods=["PATCH"])
def update_alert(alert_id):
    """Update alert status (e.g., acknowledge)"""
    data = request.get_json()
    
    for alert in alerts_db:
        if alert["id"] == alert_id:
            alert.update(data)
            return jsonify(alert)
    
    return jsonify({"error": "Alert not found"}), 404

@app.route("/alerts/<alert_id>/acknowledge", methods=["POST"])
def acknowledge_alert(alert_id):
    """Acknowledge a specific alert"""
    for alert in alerts_db:
        if alert["id"] == alert_id:
            alert["status"] = "acknowledged"
            return jsonify(alert)
    
    return jsonify({"error": "Alert not found"}), 404

@app.route("/system/status")
def system_status():
    """Get system status and statistics"""
    pending_alerts = [a for a in alerts_db if a["status"] == "pending"]
    critical_alerts = [a for a in alerts_db if a["severity"] == "critical"]
    
    return jsonify({
        "total_detections": len(alerts_db),
        "pending_alerts": len(pending_alerts),
        "critical_alerts": len(critical_alerts),
        "last_alert": alerts_db[0] if alerts_db else None,
        "system_uptime": datetime.now().isoformat(),
        "camera_status": "active"
    })

@app.route("/clear_alerts", methods=["POST"])
def clear_alerts():
    """Clear all alerts (for testing)"""
    global alerts_db
    alerts_db = []
    return jsonify({"message": "All alerts cleared"})

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)