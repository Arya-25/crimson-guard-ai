import { Shield, Moon, Sun, AlertTriangle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  alertCount: number;
}

export const Header = ({ isDarkMode, onThemeToggle, alertCount }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  C.I.D Surveillance
                </h1>
                <p className="text-xs text-muted-foreground">
                  Crime Investigation Department
                </p>
              </div>
            </div>
          </div>

          {/* Status & Controls */}
          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-success animate-pulse" />
              <span className="text-sm text-muted-foreground">
                System Online
              </span>
            </div>

            {/* Alert Counter */}
            {alertCount > 0 && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <Badge variant="destructive" className="animate-pulse">
                  {alertCount} Active Alert{alertCount !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={onThemeToggle}
              className="btn-tactical"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};