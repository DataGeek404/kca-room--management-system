
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { registerUser, storeAuthToken } from "@/services/authService";

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'lecturer' | 'maintenance';
}

interface RegisterFormProps {
  onRegister: (user: User) => void;
}

export const RegisterForm = ({ onRegister }: RegisterFormProps) => {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: 'lecturer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.name || !credentials.email || !credentials.password || !credentials.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (credentials.password !== credentials.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (credentials.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await registerUser({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        role: credentials.role
      });
      
      if (response.success && response.data) {
        storeAuthToken(response.data.token);
        
        onRegister({
          id: Number(response.data.user.id),
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role as 'admin' | 'lecturer' | 'maintenance'
        });

        toast({
          title: "Success",
          description: "Account created successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-slate-100/50 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center justify-center">
        <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl">
          <CardHeader className="text-center space-y-6 pb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto">
              <img 
                src="/lovable-uploads/7058a8d7-bb65-444c-99ce-78b033e0b8e0.png" 
                alt="KCA University Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Create Account
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Join the KCA Room Management System
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={credentials.name}
                  onChange={(e) => setCredentials(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12 px-4 text-center sm:text-left rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your KCA email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12 px-4 text-center sm:text-left rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Role
                </Label>
                <Select value={credentials.role} onValueChange={(value: 'admin' | 'lecturer' | 'maintenance') => 
                  setCredentials(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecturer">Lecturer</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="maintenance">Maintenance Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="h-12 px-4 text-center sm:text-left rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={credentials.confirmPassword}
                  onChange={(e) => setCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="h-12 px-4 text-center sm:text-left rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="text-center space-y-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                Contact IT support for role verification
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
