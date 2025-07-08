
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, UserCheck, Mail, Calendar, Shield, User as UserIcon } from "lucide-react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'lecturer' | 'maintenance';
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
}

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onStatusChange: (user: User, newStatus: string) => void;
  onRoleChange: (user: User, newRole: string) => void;
}

export const UserCard = ({ user, onEdit, onDelete, onStatusChange, onRoleChange }: UserCardProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'lecturer':
        return UserCheck;
      case 'maintenance':
        return UserIcon;
      default:
        return UserIcon;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300';
      case 'lecturer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950/30 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const RoleIcon = getRoleIcon(user.role);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Header with Avatar and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-xs">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center border border-border">
                <RoleIcon className="w-2 h-2 text-muted-foreground" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                {user.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>
          <Badge className={`${getStatusColor(user.status)} text-xs px-2 py-0.5 flex-shrink-0`} variant="secondary">
            {user.status}
          </Badge>
        </div>
        
        {/* Role and Status Controls */}
        <div className="space-y-3 mb-3 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Role</span>
            <Select 
              value={user.role} 
              onValueChange={(value) => onRoleChange(user, value)}
            >
              <SelectTrigger className="w-20 h-6 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="lecturer">Lecturer</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-muted-foreground">Status</span>
            <Select 
              value={user.status} 
              onValueChange={(value) => onStatusChange(user, value)}
            >
              <SelectTrigger className="w-20 h-6 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Last Login Info */}
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md mb-3">
          <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Last Login</p>
            <p className="text-xs font-medium text-foreground truncate">
              {formatDate(user.last_login || '')}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-7 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onEdit(user)}
            aria-label={`Edit ${user.name}`}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-7 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={() => onDelete(user)}
            aria-label={`Delete ${user.name}`}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
