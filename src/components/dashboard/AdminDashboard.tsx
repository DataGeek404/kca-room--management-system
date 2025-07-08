
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Calendar, Users, Wrench, TrendingUp, AlertTriangle } from "lucide-react";
import { getUsers } from "@/services/userService";
import { getDepartments } from "@/services/departmentService";

interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  totalBookings: number;
  pendingMaintenance: number;
  activeUsers: number;
  activeDepartments: number;
}

export const AdminDashboard = ({ activeView }: { activeView: string }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRooms: 0,
    totalBookings: 0,
    pendingMaintenance: 0,
    activeUsers: 0,
    activeDepartments: 0
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users data
      const usersResponse = await getUsers();
      const users = usersResponse.success ? usersResponse.data || [] : [];
      
      // Fetch departments data
      const deptResponse = await getDepartments();
      const departments = deptResponse.success ? deptResponse.data || [] : [];
      
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
        totalRooms: 25, // This would come from rooms API
        totalBookings: 150, // This would come from bookings API
        pendingMaintenance: 8, // This would come from maintenance API
        activeDepartments: departments.filter((d: any) => d.status === 'active').length
      });
    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of system statistics and activities</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMaintenance}</div>
            <p className="text-xs text-muted-foreground">Pending requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Departments</span>
              <span className="font-semibold">{stats.activeDepartments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">System Uptime</span>
              <span className="font-semibold text-green-600">99.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Database Status</span>
              <span className="font-semibold text-green-600">Connected</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              • {stats.totalUsers > 0 ? `${stats.totalUsers} users registered` : 'No users yet'}
            </div>
            <div className="text-sm text-gray-600">
              • {stats.activeDepartments > 0 ? `${stats.activeDepartments} departments active` : 'No departments yet'}
            </div>
            <div className="text-sm text-gray-600">
              • System monitoring active
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
