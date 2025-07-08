
import { User } from "@/types/auth";
import { 
  Home, 
  Building, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Wrench,
  Building2,
  LogOut,
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  user: User;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout?: () => Promise<void>;
}

export const AppSidebar = ({ user, activeView, setActiveView, onLogout }: AppSidebarProps) => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const getMenuItems = () => {
    const baseItems = [
      { id: "overview", label: "Dashboard", icon: Home, description: "Overview and statistics" },
    ];

    const roleSpecificItems = {
      admin: [
        { id: "rooms", label: "Room Management", icon: Building, description: "Manage rooms and facilities" },
        { id: "bookings", label: "Bookings", icon: Calendar, description: "View and manage bookings" },
        { id: "users", label: "User Management", icon: Users, description: "Manage system users" },
        { id: "departments", label: "Departments", icon: Building2, description: "Manage departments" },
        { id: "maintenance", label: "Maintenance", icon: Wrench, description: "Maintenance requests" },
        { id: "reports", label: "Reports", icon: FileText, description: "System reports and analytics" },
      ],
      lecturer: [
        { id: "bookings", label: "My Bookings", icon: Calendar, description: "View your bookings" },
        { id: "rooms", label: "Browse Rooms", icon: Building, description: "Find available rooms" },
        { id: "reports", label: "My Reports", icon: FileText, description: "Your booking history" },
      ],
      maintenance: [
        { id: "maintenance", label: "Maintenance", icon: Wrench, description: "Maintenance tasks" },
        { id: "rooms", label: "Room Status", icon: Building, description: "Room conditions" },
        { id: "reports", label: "Maintenance Reports", icon: FileText, description: "Maintenance logs" },
      ],
    };

    return [...baseItems, ...(roleSpecificItems[user.role] || [])];
  };

  const menuItems = getMenuItems();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'lecturer':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'maintenance':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Sidebar 
      className={cn(
        "border-r border-border/50 bg-background/95 backdrop-blur-sm transition-all duration-300",
        isCollapsed && "shadow-lg"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border/30 p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3 transition-all duration-300", isCollapsed && "justify-center")}>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary p-2 shadow-md">
              <img 
                src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
                alt="KCA University Logo" 
                className="h-full w-full object-contain brightness-0 invert filter"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 animate-fade-in">
                <h2 className="truncate text-sm font-bold text-foreground">KCA University</h2>
                <p className="truncate text-xs text-muted-foreground">Room Management</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("px-4 font-medium text-muted-foreground", isCollapsed && "sr-only")}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    onClick={() => setActiveView(item.id)}
                    tooltip={isCollapsed ? `${item.label} - ${item.description}` : undefined}
                    className={cn(
                      "group w-full rounded-lg px-3 py-2.5 transition-all duration-200",
                      activeView === item.id 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      isCollapsed ? "justify-center px-2" : "justify-start"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                        activeView === item.id && "scale-110",
                        !isCollapsed && "mr-3"
                      )} 
                    />
                    {!isCollapsed && (
                      <div className="flex-1 animate-fade-in text-left">
                        <span className="block truncate text-sm font-medium">{item.label}</span>
                        <span className="block truncate text-xs opacity-70">{item.description}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={cn("px-4 font-medium text-muted-foreground", isCollapsed && "sr-only")}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "settings"}
                  onClick={() => setActiveView("settings")}
                  tooltip={isCollapsed ? "Settings - Manage your preferences" : undefined}
                  className={cn(
                    "w-full rounded-lg px-3 py-2.5 transition-all duration-200",
                    activeView === "settings" 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    isCollapsed ? "justify-center px-2" : "justify-start"
                  )}
                >
                  <Settings className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <div className="flex-1 animate-fade-in text-left">
                      <span className="block text-sm font-medium">Settings</span>
                      <span className="block text-xs opacity-70">Manage preferences</span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/30 p-4">
        {!isCollapsed ? (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-accent/30 p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary shadow-md">
                <span className="text-sm font-bold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <Badge className={cn("mt-1 text-xs border", getRoleBadgeColor(user.role))} variant="outline">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
            {onLogout && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="w-full border-border/30 bg-background/50 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md">
              <span className="text-sm font-bold text-primary-foreground">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-10 w-10 p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
