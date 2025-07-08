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
      timerProgressBar: true,
      background: '#10b981',
      color: '#ffffff'
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
      timerProgressBar: true,
      background: '#ef4444',
      color: '#ffffff'
    });
  };

  const showWarningToast = (message: string) => {
    Swal.fire({
      title: 'Warning!',
      text: message,
      icon: 'warning',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#f59e0b',
      color: '#ffffff'
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

  const handleBookingClose = () => {
    setIsBookingDialogOpen(false);
  };

  const handleGenerateReport = () => {
    Swal.fire({
      title: 'Generate Report?',
      text: "This will create a comprehensive usage report.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Generate',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        showSuccessToast("Report generation started");
        // Navigate to reports view or trigger report generation
      }
    });
  };

  const handleMaintenanceCheck = () => {
    Swal.fire({
      title: 'Start Maintenance Check?',
      text: "This will initiate a system-wide maintenance check.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Start Check',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        showWarningToast("Maintenance check initiated");
        // Navigate to maintenance view or trigger maintenance workflow
      }
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
          <img 
            src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
            alt="KCA University Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">KCA Room Management Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base">System overview and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.totalRooms}</div>
            <p className="text-blue-100 text-xs sm:text-sm">Across all buildings</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.activeBookings}</div>
            <p className="text-green-100 text-xs sm:text-sm">Current schedule</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.maintenanceRequests}</div>
            <p className="text-orange-100 text-xs sm:text-sm">Rooms under maintenance</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base lg:text-lg">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.utilization}%</div>
            <p className="text-purple-100 text-xs sm:text-sm">Current usage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg lg:text-xl">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Database</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">MySQL Connection</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex-shrink-0">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base">API Server</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Backend Services</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex-shrink-0">Online</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Authentication</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">JWT Token System</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex-shrink-0">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg lg:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {/* Add Room Dialog */}
              <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 border-blue-200 transition-colors text-left h-auto w-full"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Plus className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-blue-900 text-sm truncate">Add Room</div>
                        <div className="text-xs text-blue-700 truncate">Create new room</div>
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
                    className="p-3 sm:p-4 bg-green-50 hover:bg-green-100 border-green-200 transition-colors text-left h-auto w-full"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-green-900 text-sm truncate">Add Booking</div>
                        <div className="text-xs text-green-700 truncate">Create booking</div>
                      </div>
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
                variant="outline"
                onClick={handleMaintenanceCheck}
                className="p-3 sm:p-4 bg-orange-50 hover:bg-orange-100 border-orange-200 transition-colors text-left h-auto w-full"
              >
                <div className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-orange-900 text-sm truncate">Maintenance</div>
                    <div className="text-xs text-orange-700 truncate">Check status</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={handleGenerateReport}
                className="p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 border-purple-200 transition-colors text-left h-auto w-full"
              >
                <div className="flex items-center gap-2 w-full">
                  <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-purple-900 text-sm truncate">Reports</div>
                    <div className="text-xs text-purple-700 truncate">Generate reports</div>
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
