import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RoomManagement } from "@/components/rooms/RoomManagement";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { UserManagement } from "@/components/admin/UserManagement";
import { DepartmentManagement } from "@/components/admin/DepartmentManagement";
import { ReportsView } from "@/components/reports/ReportsView";
import { RoomForm } from "@/components/rooms/RoomForm";
import { BookingForm } from "@/components/bookings/BookingForm";
import { getRooms, createRoom } from "@/services/roomService";
import { getMyBookings } from "@/services/bookingService";
import { Plus, Users, FileText, Settings, Building2, TrendingUp, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminDashboardProps {
  activeView: string;
}

export const AdminDashboard = ({ activeView }: AdminDashboardProps) => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    activeBookings: 0,
    maintenanceRequests: 0,
    utilization: 0
  });
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const roomsResponse = await getRooms();
        const bookingsResponse = await getMyBookings();
        
        if (roomsResponse.success && roomsResponse.data) {
          const rooms = roomsResponse.data;
          const totalRooms = rooms.length;
          const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
          
          setStats(prev => ({
            ...prev,
            totalRooms,
            maintenanceRequests: maintenanceRooms
          }));
        }

        if (bookingsResponse.success && bookingsResponse.data) {
          const bookings = bookingsResponse.data;
          const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
          
          setStats(prev => ({
            ...prev,
            activeBookings,
            utilization: Math.round((activeBookings / Math.max(stats.totalRooms, 1)) * 100)
          }));
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      }
    };

    if (activeView === "dashboard") {
      loadStats();
    }
  }, [activeView, toast]);

  const handleRoomSubmit = async (formData: any) => {
    try {
      await createRoom(formData);
      toast({
        title: "Success!",
        description: "Room created successfully",
      });
      setIsRoomDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to create room",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generation",
      description: "Report generation started successfully",
    });
  };

  const handleMaintenanceCheck = () => {
    toast({
      title: "Maintenance Check",
      description: "Maintenance check initiated",
    });
  };

  if (activeView === "rooms") {
    return <RoomManagement />;
  }
  
  if (activeView === "bookings") {
    return <BookingCalendar viewType="admin" />;
  }
  
  if (activeView === "users") {
    return <UserManagement />;
  }

  if (activeView === "departments") {
    return <DepartmentManagement />;
  }
  
  if (activeView === "reports") {
    return <ReportsView />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 lg:w-16 lg:h-16 flex-shrink-0 p-2 bg-primary/10 rounded-xl">
              <img 
                src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
                alt="KCA University Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                KCA Room Management
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Comprehensive facility management dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="gradient-primary text-white border-0 card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Total Rooms</CardTitle>
                <Building2 className="h-5 w-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold">{stats.totalRooms}</div>
              <p className="text-xs opacity-80 mt-1">Across all buildings</p>
            </CardContent>
          </Card>
          
          <Card className="gradient-success text-white border-0 card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Active Bookings</CardTitle>
                <CheckCircle className="h-5 w-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold">{stats.activeBookings}</div>
              <p className="text-xs opacity-80 mt-1">Current schedule</p>
            </CardContent>
          </Card>
          
          <Card className="gradient-warning text-white border-0 card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Maintenance</CardTitle>
                <AlertTriangle className="h-5 w-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold">{stats.maintenanceRequests}</div>
              <p className="text-xs opacity-80 mt-1">Rooms under maintenance</p>
            </CardContent>
          </Card>
          
          <Card className="gradient-info text-white border-0 card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium opacity-90">Utilization</CardTitle>
                <TrendingUp className="h-5 w-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl lg:text-3xl font-bold">{stats.utilization}%</div>
              <p className="text-xs opacity-80 mt-1">Current usage</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* System Status */}
          <Card className="xl:col-span-2 card-hover">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">System Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-sm">Database</p>
                    <p className="text-xs text-muted-foreground">MySQL Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-sm">API Server</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-sm">Auth System</p>
                    <p className="text-xs text-muted-foreground">Secure</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add Room Dialog */}
              <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full justify-start gap-3 h-12 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 interactive-element"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">Add Room</div>
                      <div className="text-xs opacity-70">Create new facility</div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4">
                  <DialogHeader>
                    <DialogTitle>Add New Room</DialogTitle>
                  </DialogHeader>
                  <RoomForm
                    onSubmit={handleRoomSubmit}
                    onCancel={() => setIsRoomDialogOpen(false)}
                    isLoading={false}
                  />
                </DialogContent>
              </Dialog>

              {/* Add Booking Dialog */}
              <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full justify-start gap-3 h-12 bg-green-50 hover:bg-green-100 text-green-700 border-green-200 interactive-element"
                    variant="outline"
                  >
                    <Users className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">New Booking</div>
                      <div className="text-xs opacity-70">Schedule room</div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Booking</DialogTitle>
                  </DialogHeader>
                  <BookingForm />
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleMaintenanceCheck}
                className="w-full justify-start gap-3 h-12 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 interactive-element"
                variant="outline"
              >
                <Settings className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Maintenance</div>
                  <div className="text-xs opacity-70">System check</div>
                </div>
              </Button>

              <Button
                onClick={handleGenerateReport}
                className="w-full justify-start gap-3 h-12 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 interactive-element"
                variant="outline"
              >
                <FileText className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Generate Report</div>
                  <div className="text-xs opacity-70">Usage analytics</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
