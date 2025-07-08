
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomManagement } from "@/components/rooms/RoomManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { ReportsView } from "@/components/reports/ReportsView";
import { DepartmentManagement } from "@/components/admin/DepartmentManagement";

interface AdminDashboardProps {
  activeView: string;
}

export const AdminDashboard = ({ activeView }: AdminDashboardProps) => {
  if (activeView === "rooms") {
    return <RoomManagement />;
  }
  
  if (activeView === "users") {
    return <UserManagement />;
  }
  
  if (activeView === "reports") {
    return <ReportsView />;
  }
  
  if (activeView === "departments") {
    return <DepartmentManagement />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-blue-100 text-sm">Available facilities</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">156</div>
            <p className="text-green-100 text-sm">Registered users</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
            <p className="text-purple-100 text-sm">Scheduled sessions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-orange-100 text-sm">Academic units</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { room: "A101", user: "Dr. Smith", time: "2:00 PM - 4:00 PM", status: "confirmed" },
              { room: "B205", user: "Prof. Johnson", time: "10:00 AM - 12:00 PM", status: "pending" },
              { room: "C301", user: "Dr. Brown", time: "9:00 AM - 11:00 AM", status: "confirmed" },
            ].map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Room {booking.room}</p>
                  <p className="text-sm text-gray-600">{booking.user}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{booking.time}</p>
                  <p className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Server</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Backup</span>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Storage Usage</span>
              <span className="text-sm text-gray-500">67% of 100GB</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
