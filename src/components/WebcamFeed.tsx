import { useState, useEffect, useRef } from "react";
import { Play, Pause, Video, VideoOff, AlertTriangle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebcamFeedProps {
  onDetection?: (detection: any) => void;
}

export const WebcamFeed = ({ onDetection }: WebcamFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [fps, setFps] = useState(0);
  
  const alertCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertCheckRef = useRef<string>("");
  
  // Backend URL - change this to your Flask server URL
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Start Flask video stream
  const startWebcam = async () => {
    try {
      setError(null);
      if (imgRef.current) {
        imgRef.current.src = `${BACKEND_URL}/video_feed?${Date.now()}`;
        setIsStreaming(true);
        startAlertChecking();
      }
    } catch (err) {
      setError(`Failed to connect to camera: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Stop video stream
  const stopWebcam = () => {
    if (imgRef.current) {
      imgRef.current.src = "";
    }
    setIsStreaming(false);
    setIsDetecting(false);
    stopAlertChecking();
  };

  // Check for new alerts from backend
  const checkAlerts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/alerts`);
      if (response.ok) {
        const alerts = await response.json();
        if (alerts.length > 0 && alerts[0].id !== lastAlertCheckRef.current) {
          const latestAlert = alerts[0];
          lastAlertCheckRef.current = latestAlert.id;
          
          // Convert backend alert to frontend format
          const detection = {
            id: latestAlert.id,
            weapon: latestAlert.weapon,
            confidence: latestAlert.confidence,
            timestamp: new Date(latestAlert.timestamp)
          };
          
          setDetections(prev => [detection, ...prev.slice(0, 4)]);
          onDetection?.(detection);
          setFps(30); // Simulate FPS when detecting
        }
      }
    } catch (err) {
      console.error('Failed to check alerts:', err);
    }
  };

  // Start checking for alerts
  const startAlertChecking = () => {
    setIsDetecting(true);
    alertCheckIntervalRef.current = setInterval(checkAlerts, 1000); // Check every second
  };

  // Stop checking for alerts
  const stopAlertChecking = () => {
    setIsDetecting(false);
    if (alertCheckIntervalRef.current) {
      clearInterval(alertCheckIntervalRef.current);
      alertCheckIntervalRef.current = null;
    }
  };

  // Toggle detection
  const toggleDetection = () => {
    if (isDetecting) {
      stopAlertChecking();
    } else {
      startAlertChecking();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Live Webcam Feed</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {fps} FPS
          </Badge>
          {isStreaming && (
            <Badge 
              variant={isDetecting ? "destructive" : "secondary"} 
              className={isDetecting ? "animate-pulse" : ""}
            >
              {isDetecting ? "Detecting" : "Idle"}
            </Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Video Feed */}
      <Card className="camera-feed">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {/* Flask Video Stream */}
          <img
            ref={imgRef}
            className="w-full h-full object-cover"
            style={{ display: isStreaming ? 'block' : 'none' }}
            alt="Live surveillance feed"
            onError={() => setError("Failed to load video stream. Make sure Flask backend is running on port 5000.")}
          />

          {/* Placeholder when not streaming */}
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <VideoOff className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Camera Offline</p>
                <p className="text-sm">Click start to begin surveillance</p>
              </div>
            </div>
          )}

          {/* Detection crosshair overlay */}
          {isDetecting && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Target className="h-8 w-8 text-primary/50 animate-pulse" />
              </div>
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/50"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/50"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/50"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/50"></div>
            </div>
          )}

          {/* Status indicators */}
          <div className="absolute top-4 left-4 flex space-x-2">
            <Badge variant={isStreaming ? "default" : "secondary"} className="text-xs">
              <Video className="h-3 w-3 mr-1" />
              {isStreaming ? "LIVE" : "OFFLINE"}
            </Badge>
          </div>

          {/* Timestamp */}
          <div className="absolute bottom-4 left-4">
            <Badge variant="outline" className="text-xs bg-black/70">
              {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex space-x-2">
            {!isStreaming ? (
              <Button onClick={startWebcam} className="btn-cyber">
                <Play className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopWebcam} variant="destructive">
                <Pause className="h-4 w-4 mr-2" />
                Stop Camera
              </Button>
            )}
            
            {isStreaming && (
              <Button 
                onClick={toggleDetection}
                variant={isDetecting ? "destructive" : "default"}
                className={isDetecting ? "btn-danger" : "btn-tactical"}
              >
                <Target className="h-4 w-4 mr-2" />
                {isDetecting ? "Stop Detection" : "Start Detection"}
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            Source: {isStreaming ? 'Flask Backend Stream' : 'Disconnected'}
          </div>
        </div>
      </Card>

      {/* Recent Detections */}
      {detections.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
            Recent Detections
          </h3>
          <div className="space-y-2">
            {detections.map((detection) => (
              <div
                key={detection.id}
                className="p-3 rounded-lg border alert-critical text-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive" className="text-xs">
                      {detection.weapon.toUpperCase()}
                    </Badge>
                    <span className="font-medium">
                      {(detection.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {detection.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};