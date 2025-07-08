
import { useState } from "react";
import { User } from "@/types/auth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AdminDashboard } from "./AdminDashboard";
import { LecturerDashboard } from "./LecturerDashboard"; 
import { MaintenanceDashboard } from "./MaintenanceDashboard";
import { UserSettings } from "@/components/settings/UserSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  user: User;
  onLogout?: () => Promise<void>;
}

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeView, setActiveView] = useState("overview");

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar 
          user={user} 
          activeView={activeView} 
          setActiveView={setActiveView}
          onLogout={onLogout}
        />
        
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">
                  {activeView === 'overview' ? 'Dashboard' : 
                   activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.name}
                </p>
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
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
