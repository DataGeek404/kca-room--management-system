
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
  ChevronRight,
  Menu,
  X
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
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface AppSidebarProps {
  user: User;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout?: () => Promise<void>;
}

export const AppSidebar = ({ user, activeView, setActiveView, onLogout }: AppSidebarProps) => {
  const { state, toggleSidebar } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const isCollapsed = state === "collapsed";

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

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
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
      case 'lecturer':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
      case 'maintenance':
        return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const handleMenuClick = (itemId: string) => {
    setActiveView(itemId);
    setIsMobileOpen(false); // Always close mobile menu on navigation
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed at top left */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-gray-50 transition-all duration-200 rounded-lg"
        onClick={handleMobileToggle}
      >
        {isMobileOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Fixed positioning with responsive behavior */}
      <div className={cn(
        "fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-xl z-40 transition-all duration-300 ease-in-out flex flex-col",
        // Mobile: Transform based on state
        "lg:translate-x-0", // Always visible on desktop
        isMobileOpen ? "translate-x-0 w-80" : "-translate-x-full w-80 lg:translate-x-0", // Mobile toggle
        // Desktop: Responsive width
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        
        {/* Header */}
        <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className={cn("flex items-center gap-3 transition-all duration-300", isCollapsed && !isMobileOpen && "lg:justify-center")}>
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 shadow-lg">
                <img 
                  src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
                  alt="KCA University Logo" 
                  className="h-full w-full object-contain brightness-0 invert filter"
                />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="min-w-0 animate-fade-in">
                  <h2 className="text-lg font-bold text-gray-900 truncate">KCA University</h2>
                  <p className="text-sm text-gray-600 truncate">Room Management System</p>
                </div>
              )}
            </div>
            {/* Desktop toggle button */}
            {(!isCollapsed || isMobileOpen) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="h-8 w-8 p-0 text-gray-500 hover:bg-white/50 hover:text-gray-700 transition-colors duration-200 hidden lg:flex"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-3 py-4 bg-white overflow-y-auto">
          <div className="mb-6">
            <div className={cn("px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", (isCollapsed && !isMobileOpen) && "lg:sr-only")}>
              Navigation
            </div>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    "group w-full rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 mb-1 flex items-start",
                    "border border-transparent hover:border-gray-200 hover:shadow-sm",
                    activeView === item.id 
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border-blue-200 font-semibold" 
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    (isCollapsed && !isMobileOpen) ? "lg:justify-center lg:px-2" : "justify-start"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                      activeView === item.id ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700",
                      (!isCollapsed || isMobileOpen) && "mr-3"
                    )} 
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex-1 text-left min-w-0">
                      <span className="block truncate font-medium">{item.label}</span>
                      <span className="block truncate text-xs text-gray-500 font-normal mt-0.5">{item.description}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className={cn("px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2", (isCollapsed && !isMobileOpen) && "lg:sr-only")}>
              Account
            </div>
            <button
              onClick={() => handleMenuClick("settings")}
              className={cn(
                "w-full rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 flex items-start",
                "border border-transparent hover:border-gray-200 hover:shadow-sm",
                activeView === "settings" 
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border-blue-200 font-semibold" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                (isCollapsed && !isMobileOpen) ? "lg:justify-center lg:px-2" : "justify-start"
              )}
            >
              <Settings className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                activeView === "settings" ? "text-blue-600" : "text-gray-500",
                (!isCollapsed || isMobileOpen) && "mr-3"
              )} />
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex-1 text-left min-w-0">
                  <span className="block text-sm font-medium">Settings</span>
                  <span className="block text-xs text-gray-500 font-normal mt-0.5">Preferences</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="animate-fade-in space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
                  <span className="text-sm font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <Badge className={cn("mt-1 text-xs border font-medium", getRoleBadgeColor(user.role))} variant="outline">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
              {onLogout && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="w-full border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-medium transition-all duration-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
                <span className="text-sm font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="h-10 w-10 p-2 text-gray-500 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content spacer for desktop */}
      <div className={cn(
        "hidden lg:block flex-shrink-0 transition-all duration-300",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )} />
    </>
  );
};
