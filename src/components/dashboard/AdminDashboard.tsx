
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Calendar, Users, Wrench, TrendingUp, AlertTriangle, Activity, Database } from "lucide-react";
import { getUsers } from "@/services/userService";
import { getDepartments } from "@/services/departmentService";
import { Badge } from "@/components/ui/badge";

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
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      change: "+12%",
      changeType: "positive" as const
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      subtitle: "Across all departments",
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      change: "+3%",
      changeType: "positive" as const
    },
    {
      title: "Active Bookings",
      value: stats.totalBookings,
      subtitle: "This month",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      change: "+8%",
      changeType: "positive" as const
    },
    {
      title: "Maintenance",
      value: stats.pendingMaintenance,
      subtitle: "Pending requests",
      icon: Wrench,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      change: "-5%",
      changeType: "negative" as const
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-heading">Admin Dashboard</h1>
        <p className="text-body">Overview of system statistics and activities</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid-responsive">
        {statCards.map((card, index) => (
          <Card key={card.title} className="card-elevated animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-subheading">
              <TrendingUp className="h-5 w-5 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <Database className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-2xl font-bold text-green-600">99.8%</span>
                <span className="text-xs text-muted-foreground text-center">Database Uptime</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-2xl font-bold text-blue-600">{stats.activeDepartments}</span>
                <span className="text-xs text-muted-foreground text-center">Active Departments</span>
              </div>
            </div>
            <div className="pt-4 border-t border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">System Status</span>
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  All Systems Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-subheading">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {stats.totalUsers > 0 ? `${stats.totalUsers} users registered` : 'No users yet'}
                  </p>
                  <p className="text-xs text-muted-foreground">System users</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <Building className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {stats.activeDepartments > 0 ? `${stats.activeDepartments} departments active` : 'No departments yet'}
                  </p>
                  <p className="text-xs text-muted-foreground">Department management</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <Activity className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
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
