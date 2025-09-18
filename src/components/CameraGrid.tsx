import { useState } from "react";
import { Play, Pause, Maximize, Camera as CameraIcon, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Camera, Alert } from "./Dashboard";

interface CameraGridProps {
  cameras: Camera[];
  selectedCamera: string | null;
  onSelectCamera: (cameraId: string | null) => void;
  alerts: Alert[];
}

export const CameraGrid = ({ cameras, selectedCamera, onSelectCamera, alerts }: CameraGridProps) => {
  const [playingCameras, setPlayingCameras] = useState<Set<string>>(new Set());

  const togglePlay = (cameraId: string) => {
    setPlayingCameras(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cameraId)) {
        newSet.delete(cameraId);
      } else {
        newSet.add(cameraId);
      }
      return newSet;
    });
  };

  const getCameraAlerts = (cameraName: string) => {
    return alerts.filter(alert => alert.camera === cameraName && alert.status === "pending");
  };

  const CameraFeed = ({ camera }: { camera: Camera }) => {
    const isPlaying = playingCameras.has(camera.id);
    const isSelected = selectedCamera === camera.id;
    const cameraAlerts = getCameraAlerts(camera.name);
    const hasAlert = cameraAlerts.length > 0 || camera.status === "alert";

    return (
      <Card className={`camera-feed ${isSelected ? "active" : ""} ${hasAlert ? "alert" : ""}`}>
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {/* Video Stream Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            {camera.status === "inactive" ? (
              <div className="text-center text-muted-foreground">
                <WifiOff className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Camera Offline</p>
              </div>
            ) : isPlaying ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-black">
                {/* Simulated scan lines */}
                <div className="scan-lines h-full"></div>
                {/* Crosshair overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary/50">
                    <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-primary/50 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-primary/50 -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <CameraIcon className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Camera Ready</p>
              </div>
            )}
          </div>

          {/* Camera Controls Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => togglePlay(camera.id)}
              className="btn-tactical"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSelectCamera(isSelected ? null : camera.id)}
              className="btn-tactical"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Indicators */}
          <div className="absolute top-2 left-2 flex space-x-2">
            <Badge 
              variant={camera.status === "active" ? "default" : camera.status === "alert" ? "destructive" : "secondary"}
              className="text-xs"
            >
              {camera.status === "active" && <Wifi className="h-3 w-3 mr-1" />}
              {camera.status}
            </Badge>
            {cameraAlerts.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {cameraAlerts.length} Alert{cameraAlerts.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Timestamp */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="text-xs bg-black/70">
              {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* Camera Info */}
        <div className="p-3">
          <h4 className="font-semibold text-sm">{camera.name}</h4>
          <p className="text-xs text-muted-foreground">{camera.location}</p>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Live Camera Feeds</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {cameras.filter(c => c.status === "active").length} / {cameras.length} Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((camera) => (
          <CameraFeed key={camera.id} camera={camera} />
        ))}
      </div>
    </div>
  );
};