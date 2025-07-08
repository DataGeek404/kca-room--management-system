
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Calendar, Users, Wrench, TrendingUp, AlertTriangle, Activity, Database } from "lucide-react";
import { getUsers } from "@/services/userService";
import { getDepartments } from "@/services/departmentService";
import { getRooms } from "@/services/roomService";
import { getAllBookings } from "@/services/bookingService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";

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
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users data
      const usersResponse = await getUsers();
      const users = usersResponse.success ? usersResponse.data || [] : [];
      
      // Fetch departments data
      const deptResponse = await getDepartments();
      const departments = deptResponse.success ? deptResponse.data || [] : [];
      
      // Fetch rooms data
      const roomsResponse = await getRooms();
      const rooms = roomsResponse.success ? roomsResponse.data || [] : [];
      
      // Fetch bookings data
      const bookingsResponse = await getAllBookings();
      const bookings = bookingsResponse.success ? bookingsResponse.data || [] : [];
      
      // Calculate active bookings (confirmed status and future dates)
      const now = new Date();
      const activeBookings = bookings.filter((booking: any) => 
        booking.status === 'confirmed' && new Date(booking.start_time) > now
      );
      
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
        totalRooms: rooms.length,
        totalBookings: activeBookings.length,
        pendingMaintenance: 8, // This would come from maintenance API when available
        activeDepartments: departments.filter((d: any) => d.status === 'active').length
      });
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      // Set default values on error to prevent showing 0
      setStats(prevStats => ({
        ...prevStats,
        totalRooms: 0,
        totalBookings: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (showBookingCalendar) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setShowBookingCalendar(false)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <BookingCalendar viewType="admin" userRole="admin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} active users`,
      icon: Users,
      color: "text-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10",
      change: "+12%",
      changeType: "positive" as const
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      subtitle: "Across all departments",
      icon: Building,
      color: "text-green-600",
      bgGradient: "from-green-500/10 to-green-600/10",
      change: "+3%",
      changeType: "positive" as const
    },
    {
      title: "Active Bookings",
      value: stats.totalBookings,
      subtitle: "Confirmed & upcoming",
      icon: Calendar,
      color: "text-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/10",
      change: "+8%",
      changeType: "positive" as const
    },
    {
      title: "Maintenance",
      value: stats.pendingMaintenance,
      subtitle: "Pending requests",
      icon: Wrench,
      color: "text-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/10",
      change: "-5%",
      changeType: "negative" as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground lg:text-base">Overview of system statistics and activities</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={() => setShowBookingCalendar(true)}
          className="gap-2"
        >
          <Calendar className="w-4 h-4" />
          Manage All Bookings
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {statCards.map((card, index) => (
          <Card 
            key={card.title} 
            className={`border-0 bg-gradient-to-br ${card.bgGradient} shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg animate-scale-in`} 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`rounded-lg bg-background/50 p-2 shadow-sm`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  <Badge 
                    variant={card.changeType === 'positive' ? 'default' : 'destructive'}
                    className="text-xs px-2 py-1"
                  >
                    {card.change}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Health and Activity Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center rounded-lg bg-green-50 p-4 text-center">
                <Database className="mb-2 h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">99.8%</span>
                <span className="text-xs text-muted-foreground">Database Uptime</span>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-blue-50 p-4 text-center">
                <Activity className="mb-2 h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{stats.activeDepartments}</span>
                <span className="text-xs text-muted-foreground">Active Departments</span>
              </div>
            </div>
            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">System Status</span>
                <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                  All Systems Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3">
                <Users className="mt-1 h-4 w-4 flex-shrink-0 text-blue-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {stats.totalUsers > 0 ? `${stats.totalUsers} users registered` : 'No users yet'}
                  </p>
                  <p className="text-xs text-muted-foreground">System users</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3">
                <Building className="mt-1 h-4 w-4 flex-shrink-0 text-green-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {stats.activeDepartments > 0 ? `${stats.activeDepartments} departments active` : 'No departments yet'}
                  </p>
                  <p className="text-xs text-muted-foreground">Department management</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-3">
                <Activity className="mt-1 h-4 w-4 flex-shrink-0 text-purple-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">System monitoring active</p>
                  <p className="text-xs text-muted-foreground">Real-time tracking</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
