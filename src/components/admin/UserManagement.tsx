import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, UserCheck, Wrench, Search, Filter, RefreshCw, Download, UserPlus } from "lucide-react";
import { UserCard, User } from "./UserCard";
import { UserForm } from "./UserForm";
import { getUsers, createUser, updateUserStatus, updateUserRole, deleteUser } from "@/services/userService";
import { Badge } from "@/components/ui/badge";

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users...');
      const response = await getUsers();
      console.log('Users response:', response);
      if (response.success && response.data) {
        setUsers(response.data);
        console.log('Users loaded successfully:', response.data.length);
      }
    } catch (error) {
      console.error('Load users error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting form data:', formData);
      
      if (editingUser) {
        toast({
          title: "Info",
          description: "User editing functionality not yet implemented"
        });
      } else {
        if (!formData.name || !formData.email || !formData.password || !formData.role) {
          toast({
            title: "Error",
            description: "All fields are required",
            variant: "destructive"
          });
          return;
        }

        const response = await createUser({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role
        });
        
        console.log('Create user response:', response);
        
        if (response.success) {
          toast({
            title: "Success",
            description: "User created successfully"
          });
          
          setIsAddDialogOpen(false);
          await loadUsers();
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user ${user.name}?`)) return;
    
    try {
      await deleteUser(user.id);
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (user: User, newStatus: string) => {
    try {
      await updateUserStatus(user.id, newStatus as 'active' | 'inactive');
      toast({
        title: "Success",
        description: "User status updated successfully"
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await updateUserRole(user.id, newRole as 'admin' | 'lecturer' | 'maintenance');
      toast({
        title: "Success",
        description: "User role updated successfully"
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update role",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: users.length,
    lecturers: users.filter(u => u.role === 'lecturer').length,
    admins: users.filter(u => u.role === 'admin').length,
    maintenance: users.filter(u => u.role === 'maintenance').length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">User Management</h1>
          <p className="text-sm text-muted-foreground lg:text-base">Manage system users and their permissions</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-col gap-2 sm:flex-row lg:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadUsers}
            disabled={loading}
            className="gap-2 transition-all hover:scale-105"
            aria-label="Refresh user list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 transition-all hover:scale-105"
            aria-label="Export user data"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90" aria-label="Add new user">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-md border-0 bg-background shadow-2xl"
              aria-describedby="add-user-description"
              onPointerDownOutside={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
            >
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl font-semibold text-foreground">Add New User</DialogTitle>
                <DialogDescription id="add-user-description" className="text-sm text-muted-foreground">
                  Create a new user account with name, email, password, and role
                </DialogDescription>
              </DialogHeader>
              <UserForm
                onSubmit={handleSubmit}
                onCancel={() => setIsAddDialogOpen(false)}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 shadow-md transition-all hover:scale-105 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-4 text-center lg:p-6">
            <Users className="mb-2 h-6 w-6 text-primary lg:h-8 lg:w-8" />
            <div className="text-2xl font-bold text-primary lg:text-3xl">{userStats.total}</div>
            <div className="text-xs text-muted-foreground lg:text-sm">Total Users</div>
            <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
              {userStats.active} active
            </Badge>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10 shadow-md transition-all hover:scale-105 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-4 text-center lg:p-6">
            <Users className="mb-2 h-6 w-6 text-blue-600 lg:h-8 lg:w-8" />
            <div className="text-2xl font-bold text-blue-600 lg:text-3xl">{userStats.lecturers}</div>
            <div className="text-xs text-muted-foreground lg:text-sm">Lecturers</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10 shadow-md transition-all hover:scale-105 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-4 text-center lg:p-6">
            <UserCheck className="mb-2 h-6 w-6 text-purple-600 lg:h-8 lg:w-8" />
            <div className="text-2xl font-bold text-purple-600 lg:text-3xl">{userStats.admins}</div>
            <div className="text-xs text-muted-foreground lg:text-sm">Administrators</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10 shadow-md transition-all hover:scale-105 hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-4 text-center lg:p-6">
            <Wrench className="mb-2 h-6 w-6 text-orange-600 lg:h-8 lg:w-8" />
            <div className="text-2xl font-bold text-orange-600 lg:text-3xl">{userStats.maintenance}</div>
            <div className="text-xs text-muted-foreground lg:text-sm">Maintenance Staff</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-border/50 bg-background pl-10 transition-all focus:border-primary focus:ring-primary"
                  aria-label="Search users"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Filter by role"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="lecturer">Lecturer</option>
                <option value="maintenance">Maintenance</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredUsers.length} of {users.length} users
              </span>
              {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="h-auto p-0 text-primary underline transition-colors hover:text-primary/80"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {users.length === 0 ? 'No users found' : 'No matching users'}
            </h3>
            <p className="mb-4 text-muted-foreground">
              {users.length === 0 
                ? 'Get started by creating your first user account.'
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
            {users.length === 0 && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary text-primary-foreground transition-all hover:scale-105 hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    Create First User
                  </Button>
                </DialogTrigger>
                <DialogContent 
                  className="max-w-md border-0 bg-background shadow-2xl" 
                  aria-describedby="add-first-user-description"
                  onPointerDownOutside={(e) => e.preventDefault()}
                  onInteractOutside={(e) => e.preventDefault()}
                >
                  <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl font-semibold text-foreground">Create First User</DialogTitle>
                    <DialogDescription id="add-first-user-description" className="text-sm text-muted-foreground">
                      Set up the first user account for your system
                    </DialogDescription>
                  </DialogHeader>
                  <UserForm
                    onSubmit={handleSubmit}
                    onCancel={() => setIsAddDialogOpen(false)}
                    isLoading={isSubmitting}
                  />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={(user) => {
                setEditingUser(user);
                setIsEditDialogOpen(true);
              }}
              onDelete={(user) => handleDelete(user)}
              onStatusChange={(user, status) => handleStatusChange(user, status)}
              onRoleChange={(user, role) => handleRoleChange(user, role)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent 
          className="max-w-md border-0 bg-background shadow-2xl" 
          aria-describedby="edit-user-description"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-foreground">Edit User</DialogTitle>
            <DialogDescription id="edit-user-description" className="text-sm text-muted-foreground">
              Edit user information including name, email, and role
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <UserForm
              initialData={editingUser}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingUser(null);
              }}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
