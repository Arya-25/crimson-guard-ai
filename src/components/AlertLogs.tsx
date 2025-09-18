import { useState } from "react";
import { Search, Filter, Download, Clock, MapPin, AlertTriangle, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Alert } from "./Dashboard";

interface AlertLogsProps {
  alerts: Alert[];
  onUpdateAlert: (alertId: string, updates: Partial<Alert>) => void;
}

export const AlertLogs = ({ alerts, onUpdateAlert }: AlertLogsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("timestamp");

  const filteredAlerts = alerts
    .filter(alert => {
      const matchesSearch = alert.camera.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.weapon.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
      const matchesStatus = filterStatus === "all" || alert.status === filterStatus;
      return matchesSearch && matchesSeverity && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "timestamp":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case "severity":
          const severityOrder = { critical: 3, warning: 2, info: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        case "confidence":
          return b.confidence - a.confidence;
        default:
          return 0;
      }
    });

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-primary" />;
    }
  };

  const getStatusIcon = (status: Alert["status"]) => {
    switch (status) {
      case "acknowledged":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "sent":
        return <Send className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ["Timestamp", "Camera", "Location", "Weapon", "Confidence", "Severity", "Status"],
      ...filteredAlerts.map(alert => [
        alert.timestamp.toISOString(),
        alert.camera,
        alert.location || "",
        alert.weapon,
        alert.confidence.toString(),
        alert.severity,
        alert.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cid-alerts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Alert Logs & Analytics</h2>
          <Button onClick={exportLogs} variant="outline" className="btn-tactical">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">Timestamp</SelectItem>
              <SelectItem value="severity">Severity</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-destructive/30">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {alerts.filter(a => a.severity === "critical").length}
                </p>
                <p className="text-xs text-muted-foreground">Critical Alerts</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-warning/30">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">
                  {alerts.filter(a => a.status === "pending").length}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-success/30">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">
                  {alerts.filter(a => a.status === "acknowledged").length}
                </p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 border-primary/30">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">
                  {(alerts.reduce((sum, a) => sum + a.confidence, 0) / alerts.length * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Camera</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Threat</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="text-sm">
                    {alert.timestamp.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{alert.camera}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{alert.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {alert.weapon}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {(alert.confidence * 100).toFixed(0)}%
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(alert.severity)}
                      <span className="capitalize">{alert.severity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(alert.status)}
                      <span className="capitalize">{alert.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {alert.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateAlert(alert.id, { status: "acknowledged" })}
                        className="btn-cyber text-xs"
                      >
                        Acknowledge
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};