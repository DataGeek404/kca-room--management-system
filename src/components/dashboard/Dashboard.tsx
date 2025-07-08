
import { useState } from "react";
import { User } from "@/types/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { LecturerDashboard } from "@/components/dashboard/LecturerDashboard";
import { MaintenanceDashboard } from "@/components/dashboard/MaintenanceDashboard";
import { UserSettings } from "@/components/settings/UserSettings";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activeView, setActiveView] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(user);

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleSettingsClick = () => {
    setActiveView("settings");
  };

  const renderContent = () => {
    if (activeView === "settings") {
      return (
        <UserSettings 
          user={currentUser} 
          onUserUpdate={handleUserUpdate}
        />
      );
    }

    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard activeView={activeView} />;
      case 'lecturer':
        return <LecturerDashboard activeView={activeView} />;
      case 'maintenance':
        return <MaintenanceDashboard activeView={activeView} />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        user={currentUser} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          user={currentUser} 
          onLogout={onLogout} 
          onSettings={handleSettingsClick}
        />
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
