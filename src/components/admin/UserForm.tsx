
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/services/userService";
import { Eye, EyeOff, AlertCircle, CheckCircle, Shield, UserCheck, Wrench } from "lucide-react";

interface UserFormData {
  name: string;
  email: string;
  role: 'admin' | 'lecturer' | 'maintenance';
  password?: string;
}

interface UserFormProps {
  initialData?: User;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UserForm = ({ initialData, onSubmit, onCancel, isLoading }: UserFormProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: initialData?.role || "lecturer",
    password: ""
  });

  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof UserFormData, boolean>>>({});

  const validateForm = () => {
    const newErrors: Partial<UserFormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!initialData && !formData.password) {
      newErrors.password = "Password is required for new users";
    } else if (!initialData && formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
    });
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleFieldChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: keyof UserFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'lecturer':
        return UserCheck;
      case 'maintenance':
        return Wrench;
      default:
        return UserCheck;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access and user management';
      case 'lecturer':
        return 'Room booking and teaching resources';
      case 'maintenance':
        return 'Facility maintenance and repairs';
      default:
        return '';
    }
  };

  const getFieldIcon = (field: keyof UserFormData) => {
    if (!touched[field]) return null;
    return errors[field] ? 
      <AlertCircle className="w-4 h-4 text-destructive" /> : 
      <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Full Name *
        </Label>
        <div className="relative">
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => handleFieldBlur('name')}
            placeholder="Enter full name"
            className={`pr-10 ${errors.name ? "border-destructive focus:border-destructive" : 
              touched.name && !errors.name ? "border-green-500 focus:border-green-500" : ""}`}
            required
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={!!errors.name}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getFieldIcon('name')}
          </div>
        </div>
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address *
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleFieldBlur('email')}
            placeholder="Enter email address"
            className={`pr-10 ${errors.email ? "border-destructive focus:border-destructive" : 
              touched.email && !errors.email ? "border-green-500 focus:border-green-500" : ""}`}
            required
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={!!errors.email}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getFieldIcon('email')}
          </div>
        </div>
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Role Field */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium">
          User Role *
        </Label>
        <Select 
          value={formData.role} 
          onValueChange={(value: 'admin' | 'lecturer' | 'maintenance') => 
            handleFieldChange('role', value)
          }
        >
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-medium">Administrator</div>
                  <div className="text-xs text-muted-foreground">Full system access</div>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="lecturer">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium">Lecturer</div>
                  <div className="text-xs text-muted-foreground">Room booking access</div>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="maintenance">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="font-medium">Maintenance Staff</div>
                  <div className="text-xs text-muted-foreground">Facility maintenance</div>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {getRoleDescription(formData.role)}
        </p>
      </div>

      {/* Password Field - Only for new users */}
      {!initialData && (
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              onBlur={() => handleFieldBlur('password')}
              placeholder="Enter password (min. 6 characters)"
              className={`pr-20 ${errors.password ? "border-destructive focus:border-destructive" : 
                touched.password && !errors.password ? "border-green-500 focus:border-green-500" : ""}`}
              required
              aria-describedby={errors.password ? "password-error" : "password-help"}
              aria-invalid={!!errors.password}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {getFieldIcon('password')}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? 
                  <EyeOff className="w-4 h-4 text-muted-foreground" /> : 
                  <Eye className="w-4 h-4 text-muted-foreground" />
                }
              </Button>
            </div>
          </div>
          {errors.password ? (
            <p id="password-error" className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.password}
            </p>
          ) : (
            <p id="password-help" className="text-xs text-muted-foreground">
              Use at least 6 characters with a mix of letters and numbers
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 btn-primary" 
          disabled={isLoading}
          aria-label={`${initialData ? 'Update' : 'Create'} user account`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            `${initialData ? 'Update' : 'Create'} User`
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isLoading}
          className="flex-1"
          aria-label="Cancel user form"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
