# Weapon Detection Backend

This is the Flask backend for the weapon detection surveillance system.

## Setup Instructions

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Twilio (for SMS alerts):**
   - Edit `alerts.py` and add your Twilio credentials:
     - ACCOUNT_SID
     - AUTH_TOKEN 
     - TWILIO_NUM (your Twilio phone number)
     - TARGET_NUM (phone number to receive alerts)

3. **Run the Flask server:**
   ```bash
   python enhanced_app.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

- `GET /video_feed` - Live video stream with weapon detection
- `GET /alerts` - Get all alerts
- `POST /alerts/<id>/acknowledge` - Acknowledge an alert
- `GET /system/status` - Get system statistics
- `POST /clear_alerts` - Clear all alerts (for testing)

## Frontend Integration

The frontend automatically connects to the Flask backend when you click "Start Camera". Make sure the Flask server is running on port 5000.

## Features

- Real-time weapon detection using YOLOv8
- Automatic SMS alerts via Twilio
- RESTful API for frontend integration
- Alert management and acknowledgment
- System status monitoring