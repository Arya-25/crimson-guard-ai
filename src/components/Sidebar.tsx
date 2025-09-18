import { Camera as CameraIcon, MapPin, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Camera, Alert } from "./Dashboard";

interface SidebarProps {
  cameras: Camera[];
  selectedCamera: string | null;
  onSelectCamera: (cameraId: string | null) => void;
  alerts: Alert[];
}

export const Sidebar = ({ cameras, selectedCamera, onSelectCamera, alerts }: SidebarProps) => {
  const getStatusColor = (status: Camera["status"]) => {
    switch (status) {
      case "active": return "success";
      case "alert": return "destructive";
      case "inactive": return "secondary";
      default: return "secondary";
    }
  };

  const recentAlerts = alerts.slice(0, 5);

  return (
    <aside className="w-80 border-r border-border bg-card/30 backdrop-blur-sm">
      <div className="p-4 space-y-6">
        {/* Camera Selection */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
            <CameraIcon className="h-4 w-4 mr-2 text-primary" />
            Camera Network
          </h3>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {cameras.map((camera) => (
                <Button
                  key={camera.id}
                  variant={selectedCamera === camera.id ? "default" : "ghost"}
                  className={`w-full justify-start p-3 h-auto ${
                    selectedCamera === camera.id ? "btn-cyber" : "btn-tactical"
                  }`}
                  onClick={() => onSelectCamera(
                    selectedCamera === camera.id ? null : camera.id
                  )}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="text-left">
                      <p className="font-medium text-sm">{camera.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {camera.location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge 
                        variant={getStatusColor(camera.status) as any}
                        className="text-xs"
                      >
                        {camera.status}
                      </Badge>
                      {camera.status === "alert" && (
                        <AlertCircle className="h-3 w-3 text-destructive animate-pulse" />
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Recent Alerts */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-destructive" />
            Recent Alerts
          </h3>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs ${
                    alert.severity === "critical" 
                      ? "alert-critical" 
                      : alert.severity === "warning"
                      ? "alert-warning"
                      : "alert-info"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge 
                      variant={alert.severity === "critical" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {alert.weapon.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {alert.confidence.toFixed(0)}%
                    </span>
                  </div>
                  <p className="font-medium mb-1">{alert.camera}</p>
                  <p className="text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </aside>
  );
};