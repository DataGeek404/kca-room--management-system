
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
      { id: "overview", label: "Dashboard", icon: Home, description: "System overview" },
    ];

    const roleSpecificItems = {
      admin: [
        { id: "rooms", label: "Rooms", icon: Building, description: "Manage rooms" },
        { id: "bookings", label: "Bookings", icon: Calendar, description: "All bookings" },
        { id: "users", label: "Users", icon: Users, description: "User management" },
        { id: "departments", label: "Departments", icon: Building2, description: "Department management" },
        { id: "maintenance", label: "Maintenance", icon: Wrench, description: "Maintenance requests" },
        { id: "reports", label: "Reports", icon: FileText, description: "Analytics & reports" },
      ],
      lecturer: [
        { id: "bookings", label: "My Bookings", icon: Calendar, description: "Your bookings" },
        { id: "rooms", label: "Browse Rooms", icon: Building, description: "Available rooms" },
        { id: "reports", label: "My Reports", icon: FileText, description: "Your reports" },
      ],
      maintenance: [
        { id: "maintenance", label: "Maintenance", icon: Wrench, description: "Maintenance tasks" },
        { id: "rooms", label: "Room Status", icon: Building, description: "Room conditions" },
        { id: "reports", label: "Reports", icon: FileText, description: "Maintenance logs" },
      ],
    };

    return [...baseItems, ...(roleSpecificItems[user.role] || [])];
  };

  const menuItems = getMenuItems();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'lecturer':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
      case 'maintenance':
        return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100';
    }
  };

  return (
    <Sidebar 
      className={cn(
        "border-r bg-white transition-all duration-300 ease-in-out",
        "shadow-sm border-gray-200"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-3 transition-all duration-300", isCollapsed && "justify-center")}>
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 p-2 shadow-sm">
              <img 
                src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
                alt="KCA University Logo" 
                className="h-full w-full object-contain brightness-0 invert filter"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 animate-fade-in">
                <h2 className="truncate text-sm font-bold text-gray-900">KCA University</h2>
                <p className="truncate text-xs text-gray-500">Room Management</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={cn("px-3 text-xs font-medium text-gray-500 uppercase tracking-wider", isCollapsed && "sr-only")}>
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
                      "group w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      activeView === item.id 
                        ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-200" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                      isCollapsed ? "justify-center px-2" : "justify-start"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                        activeView === item.id ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700",
                        !isCollapsed && "mr-3"
                      )} 
                    />
                    {!isCollapsed && (
                      <div className="flex-1 text-left">
                        <span className="block truncate">{item.label}</span>
                        <span className="block truncate text-xs text-gray-400">{item.description}</span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={cn("px-3 text-xs font-medium text-gray-500 uppercase tracking-wider", isCollapsed && "sr-only")}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "settings"}
                  onClick={() => setActiveView("settings")}
                  tooltip={isCollapsed ? "Settings - Manage preferences" : undefined}
                  className={cn(
                    "w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    activeView === "settings" 
                      ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-200" 
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    isCollapsed ? "justify-center px-2" : "justify-start"
                  )}
                >
                  <Settings className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                    activeView === "settings" ? "text-blue-600" : "text-gray-500",
                    !isCollapsed && "mr-3"
                  )} />
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <span className="block text-sm font-medium">Settings</span>
                      <span className="block text-xs text-gray-400">Preferences</span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-4">
        {!isCollapsed ? (
          <div className="animate-fade-in space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 shadow-sm">
                <span className="text-sm font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
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
                className="w-full border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 shadow-sm">
              <span className="text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-10 w-10 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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
