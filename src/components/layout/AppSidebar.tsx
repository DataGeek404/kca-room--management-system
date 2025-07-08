
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
  ChevronLeft
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
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'lecturer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'maintenance':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <Sidebar 
      className={cn(
        "border-r border-sidebar-border/50 bg-sidebar/95 backdrop-blur-sm transition-all duration-300",
        isCollapsed && "shadow-lg"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border/30">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3 transition-all duration-300", isCollapsed && "justify-center")}>
            <div className="w-10 h-10 bg-gradient-primary rounded-xl p-2 flex-shrink-0 shadow-md">
              <img 
                src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
                alt="KCA University Logo" 
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 animate-fade-in">
                <h2 className="font-bold text-sidebar-foreground text-sm truncate">KCA University</h2>
                <p className="text-xs text-sidebar-foreground/70 truncate">Room Management</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2 hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("px-4 text-sidebar-foreground/60 font-medium", isCollapsed && "sr-only")}>
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
                      "w-full px-3 py-2.5 rounded-lg transition-all duration-200 group",
                      activeView === item.id 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md scale-105" 
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:scale-102",
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
                      <div className="flex-1 text-left animate-fade-in">
                        <span className="block font-medium text-sm truncate">{item.label}</span>
                        <span className="block text-xs text-sidebar-foreground/60 truncate">{item.description}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={cn("px-4 text-sidebar-foreground/60 font-medium", isCollapsed && "sr-only")}>
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
                    "w-full px-3 py-2.5 rounded-lg transition-all duration-200",
                    activeView === "settings" 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground",
                    isCollapsed ? "justify-center px-2" : "justify-start"
                  )}
                >
                  <Settings className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left animate-fade-in">
                      <span className="block font-medium text-sm">Settings</span>
                      <span className="block text-xs text-sidebar-foreground/60">Manage preferences</span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/30">
        {!isCollapsed ? (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-3 p-3 bg-sidebar-accent/30 rounded-xl border border-sidebar-border/20">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-primary-foreground font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <Badge className={cn("text-xs mt-1", getRoleBadgeColor(user.role))} variant="secondary">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
            {onLogout && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="w-full bg-sidebar-accent/20 border-sidebar-border/30 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="p-2 w-10 h-10 hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
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
