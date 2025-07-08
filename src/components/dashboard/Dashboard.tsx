
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Settings, Building, Building2, Wrench, BarChart3, Bell, Clock, MapPin, FileText } from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";
import { LecturerDashboard } from "./LecturerDashboard"; 
import { MaintenanceDashboard } from "./MaintenanceDashboard";
import { UserSettings } from "@/components/settings/UserSettings";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'lecturer' | 'maintenance';
  avatar?: string;
}

interface DashboardProps {
  user: User;
  onLogout?: () => void;
}

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const getRoleSpecificTabs = () => {
    const baseTabs = [
      { id: "overview", label: "Overview", icon: BarChart3 },
      { id: "settings", label: "Settings", icon: Settings }
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseTabs.slice(0, 1),
          { id: "users", label: "Users", icon: Users },
          { id: "rooms", label: "Rooms", icon: Building },
          { id: "maintenance", label: "Maintenance", icon: Wrench },
          { id: "departments", label: "Departments", icon: Building2 },
          ...baseTabs.slice(1)
        ];
      case 'lecturer':
        return [
          ...baseTabs.slice(0, 1),
          { id: "bookings", label: "My Bookings", icon: Calendar },
          { id: "rooms", label: "Browse Rooms", icon: Building },
          { id: "reports", label: "My Reports", icon: FileText },
          ...baseTabs.slice(1)
        ];
      case 'maintenance':
        return [
          ...baseTabs.slice(0, 1),
          { id: "requests", label: "Requests", icon: Wrench },
          { id: "rooms", label: "Room Status", icon: MapPin },
          ...baseTabs.slice(1)
        ];
      default:
        return baseTabs;
    }
  };

  const tabs = getRoleSpecificTabs();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'lecturer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'maintenance':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        if (user.role === 'admin') {
          return <AdminDashboard activeView="dashboard" />;
        } else if (user.role === 'lecturer') {
          return <LecturerDashboard activeView="dashboard" />;
        } else if (user.role === 'maintenance') {
          return <MaintenanceDashboard activeView="dashboard" />;
        }
        return <div>Dashboard content for {user.role}</div>;
      
      case "bookings":
        if (user.role === 'lecturer') {
          return <LecturerDashboard activeView="bookings" />;
        }
        break;
        
      case "rooms":
        if (user.role === 'lecturer') {
          return <LecturerDashboard activeView="rooms" />;
        }
        break;
        
      case "reports":
        if (user.role === 'lecturer') {
          return <LecturerDashboard activeView="reports" />;
        }
        break;
        
      case "departments":
        if (user.role === 'admin') {
          return <AdminDashboard activeView="departments" />;
        }
        break;
      
      case "settings":
        return <UserSettings />;
      
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This feature is under development and will be available soon.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back, {user.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-1 h-auto p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-6">
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                {renderTabContent()}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
};
