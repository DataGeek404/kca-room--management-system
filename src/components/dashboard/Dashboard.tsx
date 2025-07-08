
import { useState } from "react";
import { User } from "@/types/auth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AdminDashboard } from "./AdminDashboard";
import { LecturerDashboard } from "./LecturerDashboard"; 
import { MaintenanceDashboard } from "./MaintenanceDashboard";
import { RoomManagement } from "@/components/rooms/RoomManagement";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { UserManagement } from "@/components/admin/UserManagement";
import { DepartmentManagement } from "@/components/admin/DepartmentManagement";
import { MaintenanceRequests } from "@/components/maintenance/MaintenanceRequests";
import { ReportsView } from "@/components/reports/ReportsView";
import { UserSettings } from "@/components/settings/UserSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Clock, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface DashboardProps {
  user: User;
  onLogout?: () => Promise<void>;
}

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeView, setActiveView] = useState("overview");

  const getPageTitle = () => {
    switch (activeView) {
      case "overview":
        return "Dashboard";
      case "rooms":
        return "Room Management";
      case "bookings":
        return user.role === 'admin' ? 'All Bookings' : 'My Bookings';
      case "users":
        return "User Management";
      case "departments":
        return "Department Management";
      case "maintenance":
        return "Maintenance";
      case "reports":
        return "Reports";
      case "settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  const getPageDescription = () => {
    switch (activeView) {
      case "overview":
        return `Welcome back, ${user.name}. Here's your system overview.`;
      case "rooms":
        return "Manage rooms, facilities, and availability";
      case "bookings":
        return user.role === 'admin' ? 'Monitor and manage all bookings' : 'View and manage your bookings';
      case "users":
        return "Manage system users and permissions";
      case "departments":
        return "Organize and manage departments";
      case "maintenance":
        return "Track and manage maintenance requests";
      case "reports":
        return "View detailed analytics and reports";
      case "settings":
        return "Customize your preferences and profile";
      default:
        return `Welcome back, ${user.name}`;
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        if (user.role === 'admin') {
          return <AdminDashboard activeView="overview" />;
        } else if (user.role === 'lecturer') {
          return <LecturerDashboard activeView="overview" />;
        } else if (user.role === 'maintenance') {
          return <MaintenanceDashboard activeView="overview" />;
        }
        return <div>Dashboard content for {user.role}</div>;
      
      case "rooms":
        return <RoomManagement />;
      
      case "bookings":
        return <BookingCalendar viewType={user.role === 'admin' ? 'admin' : 'user'} />;
      
      case "users":
        return user.role === 'admin' ? <UserManagement /> : (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Bell className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You don't have permission to access user management.
              </p>
            </CardContent>
          </Card>
        );
      
      case "departments":
        return user.role === 'admin' ? <DepartmentManagement /> : (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Bell className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You don't have permission to access department management.
              </p>
            </CardContent>
          </Card>
        );
      
      case "maintenance":
        return <MaintenanceRequests />;
      
      case "reports":
        return <ReportsView />;
      
      case "settings":
        return <UserSettings />;
      
      default:
        return (
          <Card className="border-0 shadow-md">
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
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar 
          user={user} 
          activeView={activeView} 
          setActiveView={setActiveView}
          onLogout={onLogout}
        />
        
        <SidebarInset className="flex-1">
          {/* Enhanced Header */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background/95 px-4 backdrop-blur-sm">
            <SidebarTrigger className="-ml-1" />
            
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="hidden lg:block">
                  <h1 className="text-xl font-bold text-foreground">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {getPageDescription()}
                  </p>
                </div>
                <div className="lg:hidden">
                  <h1 className="text-lg font-semibold text-foreground">
                    {getPageTitle()}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
                
                <Button variant="outline" size="sm" className="hidden gap-2 lg:flex">
                  <Bell className="h-4 w-4" />
                  <span className="hidden xl:inline">Notifications</span>
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                    3
                  </Badge>
                </Button>
                
                <div className="hidden items-center gap-2 text-sm text-muted-foreground lg:flex">
                  <Clock className="h-4 w-4" />
                  <span className="hidden md:inline">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="hidden items-center gap-2 border-l border-border/50 pl-2 lg:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <span className="text-sm font-semibold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="animate-fade-in">
                {renderContent()}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
