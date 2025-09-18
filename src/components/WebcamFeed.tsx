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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [fps, setFps] = useState(0);
  
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Start webcam stream
  const startWebcam = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'environment' 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError(`Camera access denied: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Stop webcam stream
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsDetecting(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
  };

  // Calculate FPS
  const calculateFPS = () => {
    const now = Date.now();
    frameCountRef.current++;
    
    if (now - lastFrameTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }
  };

  // Simulate weapon detection (replace with actual AI model)
  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simulate detection processing
    if (Math.random() < 0.05) { // 5% chance of detection
      const mockDetection = {
        id: Date.now(),
        weapon: Math.random() > 0.5 ? 'knife' : 'gun',
        confidence: 0.6 + Math.random() * 0.4,
        bbox: {
          x: Math.random() * 0.6 * canvas.width,
          y: Math.random() * 0.6 * canvas.height,
          width: 100 + Math.random() * 100,
          height: 100 + Math.random() * 100
        },
        timestamp: new Date()
      };
      
      setDetections(prev => [mockDetection, ...prev.slice(0, 4)]);
      onDetection?.(mockDetection);
      
      // Draw detection box
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(
        mockDetection.bbox.x,
        mockDetection.bbox.y,
        mockDetection.bbox.width,
        mockDetection.bbox.height
      );
      
      // Draw label
      ctx.fillStyle = '#ef4444';
      ctx.font = '16px monospace';
      ctx.fillText(
        `${mockDetection.weapon.toUpperCase()} ${(mockDetection.confidence * 100).toFixed(0)}%`,
        mockDetection.bbox.x,
        mockDetection.bbox.y - 5
      );
    }
    
    calculateFPS();
  };

  // Toggle detection
  const toggleDetection = () => {
    if (isDetecting) {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      setIsDetecting(false);
    } else {
      detectionIntervalRef.current = setInterval(processFrame, 100); // 10 FPS detection
      setIsDetecting(true);
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
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ display: isStreaming ? 'block' : 'none' }}
          />
          
          {/* Canvas for detection overlay */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: isDetecting ? 'block' : 'none' }}
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
            Resolution: {isStreaming && videoRef.current ? 
              `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}` : 
              'Unknown'}
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