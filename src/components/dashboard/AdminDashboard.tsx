
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomManagement } from "@/components/rooms/RoomManagement";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { UserManagement } from "@/components/admin/UserManagement";
import { ReportsView } from "@/components/reports/ReportsView";

interface AdminDashboardProps {
  activeView: string;
}

export const AdminDashboard = ({ activeView }: AdminDashboardProps) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-blue-100 text-sm">Across 3 buildings</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
            <p className="text-green-100 text-sm">Today's schedule</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-orange-100 text-sm">Pending requests</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87%</div>
            <p className="text-purple-100 text-sm">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: "Room A101 booked", user: "Prof. Johnson", time: "2 hours ago" },
              { action: "Maintenance completed", room: "B205", time: "4 hours ago" },
              { action: "New user registered", user: "Dr. Smith", time: "6 hours ago" },
              { action: "Room C301 booking cancelled", user: "Prof. Davis", time: "8 hours ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">
                    {activity.user && `by ${activity.user}`}
                    {activity.room && `for ${activity.room}`}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
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
                <div className="text-sm text-orange-700">Review requests</div>
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
