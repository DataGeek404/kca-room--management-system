
import { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header = ({ user, onLogout }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name.split(' ')[1]}
          </h1>
          <p className="text-gray-600">
            Manage your university facilities efficiently
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={onLogout}
          className="hover:bg-red-50 hover:border-red-200 hover:text-red-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};
