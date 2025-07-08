
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomManagement } from "@/components/rooms/RoomManagement";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { UserManagement } from "@/components/admin/UserManagement";
import { ReportsView } from "@/components/reports/ReportsView";
import { getRooms } from "@/services/roomService";
import { getMyBookings } from "@/services/bookingService";

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

  if (activeView === "rooms") {
    return <RoomManagement />;
  }
  
  if (activeView === "bookings") {
    return <BookingCalendar viewType="admin" />;
  }
  
  if (activeView === "users") {
    return <UserManagement />;
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
          <h1 className="text-2xl font-bold text-gray-900">KCA Room Management Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRooms}</div>
            <p className="text-blue-100 text-sm">Across all buildings</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeBookings}</div>
            <p className="text-green-100 text-sm">Current schedule</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.maintenanceRequests}</div>
            <p className="text-orange-100 text-sm">Rooms under maintenance</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.utilization}%</div>
            <p className="text-purple-100 text-sm">Current usage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-500">MySQL Connection</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">API Server</p>
                <p className="text-sm text-gray-500">Backend Services</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Online</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">Authentication</p>
                <p className="text-sm text-gray-500">JWT Token System</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="font-medium text-blue-900">Add Room</div>
                <div className="text-sm text-blue-700">Create new room</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                <div className="font-medium text-green-900">View Bookings</div>
                <div className="text-sm text-green-700">Check schedule</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
                <div className="font-medium text-orange-900">Maintenance</div>
                <div className="text-sm text-orange-700">Manage status</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
                <div className="font-medium text-purple-900">Reports</div>
                <div className="text-sm text-purple-700">Generate reports</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
