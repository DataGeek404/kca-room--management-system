
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, Users, MapPin, Edit, Trash2, Search } from "lucide-react";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/services/departmentService";

interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  head_of_department?: string;
  contact_email?: string;
  contact_phone?: string;
  building?: string;
  floor?: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface DepartmentFormData {
  name: string;
  code: string;
  description: string;
  head_of_department: string;
  contact_email: string;
  contact_phone: string;
  building: string;
  floor: string;
}

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    code: "",
    description: "",
    head_of_department: "",
    contact_email: "",
    contact_phone: "",
    building: "",
    floor: ""
  });

  const loadDepartments = async () => {
    try {
      setLoading(true);
      console.log('Loading departments...');
      const response = await getDepartments();
      console.log('Departments response:', response);
      if (response.success && response.data) {
        setDepartments(response.data);
        console.log('Departments loaded successfully:', response.data.length);
      }
    } catch (error) {
      console.error('Load departments error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load departments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      head_of_department: "",
      contact_email: "",
      contact_phone: "",
      building: "",
      floor: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      toast({
        title: "Error",
        description: "Department name and code are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const departmentData = {
        ...formData,
        floor: formData.floor ? parseInt(formData.floor) : undefined
      };

      if (editingDepartment) {
        const response = await updateDepartment(editingDepartment.id, departmentData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Department updated successfully"
          });
          setIsEditDialogOpen(false);
          setEditingDepartment(null);
        }
      } else {
        const response = await createDepartment(departmentData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Department created successfully"
          });
          setIsAddDialogOpen(false);
        }
      }
      
      resetForm();
      await loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || "",
      head_of_department: department.head_of_department || "",
      contact_email: department.contact_email || "",
      contact_phone: department.contact_phone || "",
      building: department.building || "",
      floor: department.floor?.toString() || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (department: Department) => {
    if (!confirm(`Are you sure you want to delete ${department.name}?`)) return;
    
    try {
      await deleteDepartment(department.id);
      toast({
        title: "Success",
        description: "Department deleted successfully"
      });
      await loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete department",
        variant: "destructive"
      });
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departmentStats = {
    total: departments.length,
    active: departments.filter(d => d.status === 'active').length,
    buildings: new Set(departments.map(d => d.building).filter(Boolean)).size
  };

  const DepartmentForm = ({ onClose }: { onClose: () => void }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Department Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Computer Science"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Department Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            placeholder="CS"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Department description..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="head">Head of Department</Label>
        <Input
          id="head"
          value={formData.head_of_department}
          onChange={(e) => setFormData(prev => ({ ...prev, head_of_department: e.target.value }))}
          placeholder="Dr. John Smith"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
            placeholder="dept@university.edu"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Contact Phone</Label>
          <Input
            id="phone"
            value={formData.contact_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="building">Building</Label>
          <Input
            id="building"
            value={formData.building}
            onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
            placeholder="Science Block"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="floor">Floor</Label>
          <Input
            id="floor"
            type="number"
            value={formData.floor}
            onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
            placeholder="2"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : (editingDepartment ? 'Update' : 'Create')} Department
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600">Manage university departments and their information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>
                Create a new department with contact information and location details
              </DialogDescription>
            </DialogHeader>
            <DepartmentForm onClose={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{departmentStats.total}</div>
            <div className="text-sm text-gray-600">Total Departments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{departmentStats.active}</div>
            <div className="text-sm text-gray-600">Active Departments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">{departmentStats.buildings}</div>
            <div className="text-sm text-gray-600">Buildings</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Departments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <Card key={department.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    <p className="text-sm text-gray-500 font-mono">{department.code}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(department)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(department)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {department.description && (
                  <p className="text-sm text-gray-600">{department.description}</p>
                )}
                {department.head_of_department && (
                  <p className="text-sm"><strong>Head:</strong> {department.head_of_department}</p>
                )}
                {department.building && (
                  <p className="text-sm"><strong>Location:</strong> {department.building}
                    {department.floor && `, Floor ${department.floor}`}
                  </p>
                )}
                {department.contact_email && (
                  <p className="text-sm"><strong>Email:</strong> {department.contact_email}</p>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    department.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {department.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(department.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information and contact details
            </DialogDescription>
          </DialogHeader>
          <DepartmentForm onClose={() => {
            setIsEditDialogOpen(false);
            setEditingDepartment(null);
            resetForm();
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
