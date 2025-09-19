    from ultralytics import YOLO

    # Load YOLOv8 model (nano version for speed)
    model = YOLO("yolov8n.pt")

    def detect(frame):
        results = model(frame)
        detections = []
        for r in results[0].boxes.data.tolist():
            x1, y1, x2, y2, conf, cls = r
            label = model.names[int(cls)]
            detections.append({"label": label, "confidence": float(conf)})
        return detections, results[0].plot()
