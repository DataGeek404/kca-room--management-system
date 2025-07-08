
import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { User } from "@/types/auth";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Check for existing authentication session
    // This should be replaced with real session checking
    const checkAuthSession = async () => {
      try {
        // const session = await getCurrentSession();
        // if (session) {
        //   setCurrentUser(session.user);
        // }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthSession();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // TODO: Store session in secure storage
  };

  const handleLogout = async () => {
    try {
      // TODO: Call logout API
      // await logoutUser();
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <Dashboard user={currentUser} onLogout={handleLogout} />;
};

export default Index;
