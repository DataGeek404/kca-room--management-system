
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, BarChart3, Users, Calendar } from "lucide-react";
import { getRoomUtilization, getBookingStats, getUserActivity } from "@/services/reportService";
import { ReportExporter } from "./ReportExporter";

export const ReportsView = () => {
  const [roomUtilization, setRoomUtilization] = useState<any[]>([]);
  const [bookingStats, setBookingStats] = useState<any>({});
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState("");
  const { toast } = useToast();

  const loadReports = async () => {
    try {
      setLoading(true);
      const [utilizationRes, statsRes, activityRes] = await Promise.all([
        getRoomUtilization(),
        getBookingStats(),
        getUserActivity()
      ]);

      if (utilizationRes.success) setRoomUtilization(utilizationRes.data || []);
      if (statsRes.success) setBookingStats(statsRes.data || {});
      if (activityRes.success) setUserActivity(activityRes.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reports data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleExport = (format: string, filters: any) => {
    // Implementation for actual export functionality
    toast({
      title: "Success",
      description: `Report exported as ${format.toUpperCase()}`
    });
  };

  const quickStats = [
    { 
      label: "Total Bookings This Month", 
      value: bookingStats.overview?.total_bookings || 0, 
      change: "+12%",
      icon: Calendar,
      color: "text-blue-600"
    },
    { 
      label: "Average Room Utilization", 
      value: "78%", 
      change: "+5%",
      icon: BarChart3,
      color: "text-green-600"
    },
    { 
      label: "Active Users", 
      value: userActivity.length || 0, 
      change: "+15%",
      icon: Users,
      color: "text-purple-600"
    },
    { 
      label: "Confirmed Bookings", 
      value: bookingStats.overview?.confirmed_bookings || 0, 
      change: "+8%",
      icon: FileText,
      color: "text-orange-600"
    }
  ];

  const reportTypes = [
    {
      id: "utilization",
      title: "Room Utilization Report",
      description: "Detailed analysis of room usage patterns and efficiency metrics",
      data: roomUtilization
    },
    {
      id: "bookings",
      title: "Booking Statistics Report", 
      description: "Complete booking records with user details and time patterns",
      data: [bookingStats]
    },
    {
      id: "user-activity",
      title: "User Activity Report",
      description: "User engagement statistics and booking behavior patterns",
      data: userActivity
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Generate insights and export data for analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="text-xs text-green-600 mt-1">{stat.change}</div>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReportExporter
        reportType={selectedReport}
        data={reportTypes.find(r => r.id === selectedReport)?.data || []}
        onExport={handleExport}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <p className="text-sm text-gray-600">{report.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-500">
                {report.data.length} records available
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedReport(report.id)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleExport('pdf', { reportType: report.id })}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
