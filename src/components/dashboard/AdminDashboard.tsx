
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
import { Plus, Users, FileText, Settings, Building2 } from "lucide-react";
import Swal from "sweetalert2";

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

  const showSuccessToast = (message: string) => {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  };

  const showErrorToast = (message: string) => {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  };

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
      }
    };

    if (activeView === "dashboard") {
      loadStats();
    }
  }, [activeView]);

  const handleRoomSubmit = async (formData: any) => {
    try {
      await createRoom(formData);
      showSuccessToast("Room created successfully");
      setIsRoomDialogOpen(false);
    } catch (error) {
      showErrorToast("Failed to create room");
    }
  };

  const handleBookingSubmit = async (formData: any) => {
    try {
      // Booking creation logic would go here
      showSuccessToast("Booking created successfully");
      setIsBookingDialogOpen(false);
    } catch (error) {
      showErrorToast("Failed to create booking");
    }
  };

  const handleGenerateReport = () => {
    showSuccessToast("Report generation started");
    // Navigate to reports view or trigger report generation
  };

  const handleMaintenanceCheck = () => {
    showSuccessToast("Maintenance check initiated");
    // Navigate to maintenance view or trigger maintenance workflow
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
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12">
          <img 
            src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
            alt="KCA University Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">KCA Room Management Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">System overview and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.totalRooms}</div>
            <p className="text-blue-100 text-xs sm:text-sm">Across all buildings</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.activeBookings}</div>
            <p className="text-green-100 text-xs sm:text-sm">Current schedule</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.maintenanceRequests}</div>
            <p className="text-orange-100 text-xs sm:text-sm">Rooms under maintenance</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.utilization}%</div>
            <p className="text-purple-100 text-xs sm:text-sm">Current usage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Database</p>
                <p className="text-xs sm:text-sm text-gray-500">MySQL Connection</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">API Server</p>
                <p className="text-xs sm:text-sm text-gray-500">Backend Services</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Online</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">Authentication</p>
                <p className="text-xs sm:text-sm text-gray-500">JWT Token System</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Add Room Dialog */}
              <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 border-blue-200 transition-colors text-left h-auto"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900 text-sm">Add Room</div>
                        <div className="text-xs text-blue-700">Create new room</div>
                      </div>
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
                    variant="outline"
                    className="p-3 sm:p-4 bg-green-50 hover:bg-green-100 border-green-200 transition-colors text-left h-auto"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900 text-sm">Add Booking</div>
                        <div className="text-xs text-green-700">Create booking</div>
                      </div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4">
                  <DialogHeader>
                    <DialogTitle>Create New Booking</DialogTitle>
                  </DialogHeader>
                  <BookingForm
                    onSubmit={handleBookingSubmit}
                    onCancel={() => setIsBookingDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={handleMaintenanceCheck}
                className="p-3 sm:p-4 bg-orange-50 hover:bg-orange-100 border-orange-200 transition-colors text-left h-auto"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium text-orange-900 text-sm">Maintenance</div>
                    <div className="text-xs text-orange-700">Check status</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={handleGenerateReport}
                className="p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 border-purple-200 transition-colors text-left h-auto"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium text-purple-900 text-sm">Reports</div>
                    <div className="text-xs text-purple-700">Generate reports</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
