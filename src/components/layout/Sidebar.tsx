
import { User } from "@/types/auth";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  User as UserIcon,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  user: User;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar = ({ user, activeView, setActiveView }: SidebarProps) => {
  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: UserIcon },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { id: "rooms", label: "Room Management", icon: ArrowRight },
          { id: "bookings", label: "All Bookings", icon: Calendar },
          { id: "users", label: "User Management", icon: UserIcon },
          { id: "reports", label: "Reports", icon: ArrowLeft },
        ];
      case 'lecturer':
        return [
          ...baseItems,
          { id: "browse", label: "Browse Rooms", icon: ArrowRight },
          { id: "book", label: "Book Room", icon: Calendar },
          { id: "mybookings", label: "My Bookings", icon: UserIcon },
        ];
      case 'maintenance':
        return [
          ...baseItems,
          { id: "requests", label: "Maintenance Requests", icon: ArrowRight },
          { id: "rooms", label: "Room Status", icon: Calendar },
          { id: "history", label: "Maintenance History", icon: UserIcon },
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">KCA</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Room System</h1>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start h-11 px-3",
              activeView === item.id 
                ? "bg-blue-50 text-blue-700 border border-blue-200" 
                : "text-gray-700 hover:bg-gray-100"
            )}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
