
import { useState } from "react";
import { User } from "@/types/auth";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Wrench,
  Building2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user: User;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar = ({ user, activeView, setActiveView }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: Home },
    ];

    const roleSpecificItems = {
      admin: [
        { id: "rooms", label: "Room Management", icon: Building },
        { id: "bookings", label: "Bookings", icon: Calendar },
        { id: "users", label: "User Management", icon: Users },
        { id: "departments", label: "Departments", icon: Building2 },
        { id: "reports", label: "Reports", icon: FileText },
        { id: "settings", label: "Settings", icon: Settings },
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

  const handleMenuClick = (itemId: string) => {
    setActiveView(itemId);
    setIsMobileOpen(false); // Close mobile menu when item is selected
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm border shadow-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col shadow-xl",
        "fixed inset-y-0 left-0 z-40 lg:relative lg:z-0",
        // Mobile styles
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        // Desktop styles
        isCollapsed ? "lg:w-16" : "w-64 lg:w-64"
      )}>
        
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-primary/10 rounded-xl p-2 flex-shrink-0">
                  <img 
                    src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
                    alt="KCA University Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-sidebar-foreground text-sm truncate">KCA University</h2>
                  <p className="text-xs text-sidebar-foreground/70 truncate">Room Management</p>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-sidebar-accent hidden lg:flex flex-shrink-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                    "hover:bg-sidebar-accent hover:scale-105",
                    activeView === item.id
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg border border-sidebar-primary/20"
                      : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                    activeView === item.id && "scale-110"
                  )} />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="font-medium text-sm truncate">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-4 border-t border-sidebar-border">
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
                <p className="text-xs text-sidebar-foreground/70 capitalize truncate">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
