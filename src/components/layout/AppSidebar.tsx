
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
  LogOut
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

interface AppSidebarProps {
  user: User;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout?: () => Promise<void>;
}

export const AppSidebar = ({ user, activeView, setActiveView, onLogout }: AppSidebarProps) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const getMenuItems = () => {
    const baseItems = [
      { id: "overview", label: "Dashboard", icon: Home },
    ];

    const roleSpecificItems = {
      admin: [
        { id: "rooms", label: "Room Management", icon: Building },
        { id: "bookings", label: "Bookings", icon: Calendar },
        { id: "users", label: "User Management", icon: Users },
        { id: "departments", label: "Departments", icon: Building2 },
        { id: "maintenance", label: "Maintenance", icon: Wrench },
        { id: "reports", label: "Reports", icon: FileText },
      ],
      lecturer: [
        { id: "bookings", label: "My Bookings", icon: Calendar },
        { id: "rooms", label: "Browse Rooms", icon: Building },
        { id: "reports", label: "My Reports", icon: FileText },
      ],
      maintenance: [
        { id: "maintenance", label: "Maintenance", icon: Wrench },
        { id: "rooms", label: "Room Status", icon: Building },
        { id: "reports", label: "Maintenance Reports", icon: FileText },
      ],
    };

    return [...baseItems, ...(roleSpecificItems[user.role] || [])];
  };

  const menuItems = getMenuItems();

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

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl p-2 flex-shrink-0">
            <img 
              src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
              alt="KCA University Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="font-bold text-sidebar-foreground text-sm truncate">KCA University</h2>
              <p className="text-xs text-sidebar-foreground/70 truncate">Room Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeView === item.id}
                    onClick={() => setActiveView(item.id)}
                    tooltip={isCollapsed ? item.label : undefined}
                    className={isCollapsed ? "justify-center px-2" : ""}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "settings"}
                  onClick={() => setActiveView("settings")}
                  tooltip={isCollapsed ? "Settings" : undefined}
                  className={isCollapsed ? "justify-center px-2" : ""}
                >
                  <Settings className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-sidebar-accent rounded-xl">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
            {onLogout && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {onLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="p-2 w-10 h-10"
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
