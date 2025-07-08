
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, LoginCredentials } from "@/types/auth";

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: ""
  });

  // Mock users for demo
  const mockUsers = [
    { id: "1", name: "Dr. Sarah Admin", email: "admin@kca.ac.ke", role: "admin" as const },
    { id: "2", name: "Prof. John Lecturer", email: "lecturer@kca.ac.ke", role: "lecturer" as const },
    { id: "3", name: "Mike Maintenance", email: "maintenance@kca.ac.ke", role: "maintenance" as const }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication - in real app, this would call an API
    const user = mockUsers.find(u => u.email === credentials.email);
    if (user) {
      onLogin(user);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'lecturer' | 'maintenance') => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-xl">KCA</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Room Management System
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to manage university facilities
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="h-11"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Demo Access</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleDemoLogin('admin')}
              className="h-10 text-sm hover:bg-blue-50 hover:border-blue-200"
            >
              Demo as Administrator
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleDemoLogin('lecturer')}
              className="h-10 text-sm hover:bg-green-50 hover:border-green-200"
            >
              Demo as Lecturer
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleDemoLogin('maintenance')}
              className="h-10 text-sm hover:bg-orange-50 hover:border-orange-200"
            >
              Demo as Maintenance Staff
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
