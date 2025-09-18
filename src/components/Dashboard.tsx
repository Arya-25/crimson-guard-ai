import { useState, useEffect } from "react";
import { CameraGrid } from "./CameraGrid";
import { AlertPanel } from "./AlertPanel";
import { AlertLogs } from "./AlertLogs";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

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

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: "active" | "inactive" | "alert";
  stream?: string;
  lastActivity: Date;
}

const Dashboard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize mock data
  useEffect(() => {
    const mockCameras: Camera[] = [
      {
        id: "cam-001",
        name: "Main Entrance",
        location: "Building A - Ground Floor",
        status: "active",
        lastActivity: new Date(),
      },
      {
        id: "cam-002", 
        name: "Parking Garage",
        location: "Underground Level B1",
        status: "active",
        lastActivity: new Date(),
      },
      {
        id: "cam-003",
        name: "Lobby Security",
        location: "Building A - Lobby",
        status: "alert",
        lastActivity: new Date(),
      },
      {
        id: "cam-004",
        name: "Emergency Exit",
        location: "Building A - West Wing",
        status: "active",
        lastActivity: new Date(),
      },
    ];

    const mockAlerts: Alert[] = [
      {
        id: "alert-001",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        camera: "Main Entrance",
        weapon: "knife",
        confidence: 0.87,
        severity: "critical",
        location: "Building A - Ground Floor",
        status: "sent",
      },
      {
        id: "alert-002", 
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        camera: "Parking Garage",
        weapon: "gun",
        confidence: 0.94,
        severity: "critical",
        location: "Underground Level B1", 
        status: "acknowledged",
      },
    ];

    setCameras(mockCameras);
    setAlerts(mockAlerts);
  }, []);

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          timestamp: new Date(),
          camera: cameras[Math.floor(Math.random() * cameras.length)]?.name || "Unknown",
          weapon: Math.random() > 0.5 ? "knife" : "gun",
          confidence: 0.6 + Math.random() * 0.4,
          severity: Math.random() > 0.7 ? "critical" : "warning",
          location: "Random Location",
          status: "pending",
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [cameras]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("light");
  };

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? "" : "light"}`}>
      <div className="scan-lines">
        <Header
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
          alertCount={alerts.filter(a => a.status === "pending").length}
        />
        
        <div className="flex">
          <Sidebar 
            cameras={cameras}
            selectedCamera={selectedCamera}
            onSelectCamera={setSelectedCamera}
            alerts={alerts}
          />
          
          <main className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Camera Grid - Takes up 2/3 on large screens */}
              <div className="xl:col-span-2">
                <CameraGrid
                  cameras={cameras}
                  selectedCamera={selectedCamera}
                  onSelectCamera={setSelectedCamera}
                  alerts={alerts}
                />
              </div>
              
              {/* Alert Panel - Takes up 1/3 on large screens */}
              <div className="xl:col-span-1">
                <AlertPanel 
                  alerts={alerts}
                  onAcknowledgeAlert={(id) => {
                    setAlerts(prev => prev.map(alert => 
                      alert.id === id ? { ...alert, status: "acknowledged" } : alert
                    ));
                  }}
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
    </div>
  );
};

export default Dashboard;