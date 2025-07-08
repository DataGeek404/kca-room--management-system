
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
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  user: User;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar = ({ user, activeView, setActiveView }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8">
              <img 
                src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
                alt="KCA University Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">KCA University</h2>
              <p className="text-xs text-gray-500">Room Management</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                  activeView === item.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  activeView === item.id ? "text-blue-600" : "text-gray-500"
                )} />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
