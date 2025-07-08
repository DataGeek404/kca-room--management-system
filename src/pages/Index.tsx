
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";

const Index = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState("overview");
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    switch (activeView) {
      case "overview":
        return "Dashboard";
      case "rooms":
        return "Room Management";
      case "bookings":
        return "Bookings";
      case "users":
        return "User Management";
      case "departments":
        return "Departments";
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

  return (
    <>
      <AppSidebar 
        user={user} 
        activeView={activeView} 
        setActiveView={setActiveView}
        onLogout={logout}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  {getPageTitle()}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Dashboard activeView={activeView} user={user} />
        </div>
      </SidebarInset>
    </>
  );
};

export default Index;
