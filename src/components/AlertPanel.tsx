import { AlertTriangle, Clock, MapPin, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Alert } from "./Dashboard";

interface AlertPanelProps {
  alerts: Alert[];
  onAcknowledgeAlert: (alertId: string) => void;
}

export const AlertPanel = ({ alerts, onAcknowledgeAlert }: AlertPanelProps) => {
  const pendingAlerts = alerts.filter(alert => alert.status === "pending");
  const recentAlerts = alerts.slice(0, 10);

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Shield className="h-4 w-4 text-primary" />;
    }
  };

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical": return "destructive";
      case "warning": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Alert Center</h2>
        <Badge variant="destructive" className={pendingAlerts.length > 0 ? "animate-pulse" : ""}>
          {pendingAlerts.length} Pending
        </Badge>
      </div>

      {/* Pending Alerts */}
      {pendingAlerts.length > 0 && (
        <Card className="p-4 border-destructive/50 bg-destructive/5">
          <h3 className="text-sm font-semibold text-destructive mb-3 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Immediate Action Required
          </h3>
          <div className="space-y-3">
            {pendingAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg bg-background border border-destructive/30"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(alert.severity)}
                    <Badge variant={getSeverityColor(alert.severity) as any}>
                      {alert.weapon.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium">
                      {(alert.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1 mb-3">
                  <p className="text-sm font-medium">{alert.camera}</p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {alert.location}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {alert.timestamp.toLocaleString()}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => onAcknowledgeAlert(alert.id)}
                  className="btn-cyber w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Acknowledge Alert
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Alerts */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border text-sm ${
                  alert.severity === "critical" 
                    ? "alert-critical" 
                    : alert.severity === "warning"
                    ? "alert-warning"
                    : "alert-info"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(alert.severity)}
                    <span className="font-medium">{alert.weapon}</span>
                  </div>
                  <Badge 
                    variant={
                      alert.status === "acknowledged" ? "default" :
                      alert.status === "sent" ? "secondary" : "destructive"
                    }
                    className="text-xs"
                  >
                    {alert.status}
                  </Badge>
                </div>
                <p className="text-xs">{alert.camera}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};