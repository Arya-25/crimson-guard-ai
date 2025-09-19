import { useState } from "react";
import { WebcamFeed } from "./WebcamFeed";
import { AlertPanel } from "./AlertPanel";
import { AlertLogs } from "./AlertLogs";
import { Header } from "./Header";
import { Camera, Shield, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Alert {
  id: string;
  timestamp: Date;
  camera: string;
  weapon: string;
  confidence: number;
  severity: "critical" | "warning" | "info";
  image?: string;
  location?: string;
  status: "pending" | "sent" | "acknowledged";
}

const SingleCameraApp = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalDetections: 0,
    lastAlert: null as Date | null,
    systemUptime: new Date(),
  });

  const handleDetection = (detection: any) => {
    const newAlert: Alert = {
      id: detection.id || `alert-${Date.now()}`,
      timestamp: detection.timestamp || new Date(),
      camera: "Primary Webcam",
      weapon: detection.weapon,
      confidence: detection.confidence,
      severity: detection.confidence > 0.8 ? "critical" : "warning",
      location: "Local Device",
      status: "pending",
    };
    
    // Check if alert already exists to avoid duplicates
    const existingAlert = alerts.find(alert => alert.id === newAlert.id);
    if (!existingAlert) {
      setAlerts(prev => [newAlert, ...prev]);
      setSystemStats(prev => ({
        ...prev,
        totalDetections: prev.totalDetections + 1,
        lastAlert: new Date(),
      }));
    }
  };

  // Function to acknowledge alerts via backend
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, status: "acknowledged" } : alert
        ));
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      // Fallback to local state update
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: "acknowledged" } : alert
      ));
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("light");
  };

  const getUptimeString = () => {
    const uptime = Date.now() - systemStats.systemUptime.getTime();
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? "" : "light"}`}>
      <div className="scan-lines">
        <Header
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
          alertCount={alerts.filter(a => a.status === "pending").length}
        />
        
        <main className="p-6 space-y-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 border-primary/30">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-primary">1</p>
                  <p className="text-xs text-muted-foreground">Active Camera</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-destructive/30">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold text-destructive">
                    {systemStats.totalDetections}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Detections</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-warning/30">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold text-warning">
                    {alerts.filter(a => a.status === "pending").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending Alerts</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 border-success/30">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-success rounded-full animate-pulse" />
                <div>
                  <p className="text-2xl font-bold text-success">
                    {getUptimeString()}
                  </p>
                  <p className="text-xs text-muted-foreground">System Uptime</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Webcam Feed - Takes up 2/3 on large screens */}
            <div className="xl:col-span-2">
              <WebcamFeed onDetection={handleDetection} />
            </div>
            
            {/* Alert Panel - Takes up 1/3 on large screens */}
            <div className="xl:col-span-1">
              <AlertPanel 
                alerts={alerts}
                onAcknowledgeAlert={acknowledgeAlert}
              />
            </div>
          </div>
          
          {/* Alert Logs - Full width */}
          <AlertLogs 
            alerts={alerts}
            onUpdateAlert={(id, updates) => {
              setAlerts(prev => prev.map(alert =>
                alert.id === id ? { ...alert, ...updates } : alert
              ));
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default SingleCameraApp;