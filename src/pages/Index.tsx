
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { User } from "@/types/auth";

const Index = () => {
  const { user, logout, setUser, loading } = useAuth();
  
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={logout} />;
};

export default Index;
