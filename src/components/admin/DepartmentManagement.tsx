
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Department, getDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/services/departmentService";

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    head_of_department: "",
    contact_email: "",
    contact_phone: "",
    building: "",
    floor: ""
  });
  const { toast } = useToast();

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await getDepartments();
      if (response.success && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Error",
        description: "Department name and code are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingDepartment) {
        await updateDepartment(editingDepartment.id, {
          name: formData.name,
          code: formData.code,
          description: formData.description || undefined,
          head_of_department: formData.head_of_department || undefined,
          contact_email: formData.contact_email || undefined,
          contact_phone: formData.contact_phone || undefined,
          building: formData.building || undefined,
          floor: formData.floor ? parseInt(formData.floor) : undefined
        });
        toast({
          title: "Success!",
          description: "Department updated successfully",
        });
      } else {
        await createDepartment({
          name: formData.name,
          code: formData.code,
          description: formData.description || undefined,
          head_of_department: formData.head_of_department || undefined,
          contact_email: formData.contact_email || undefined,
          contact_phone: formData.contact_phone || undefined,
          building: formData.building || undefined,
          floor: formData.floor ? parseInt(formData.floor) : undefined
        });
        toast({
          title: "Success!",
          description: "Department created successfully",
        });
      }
      
      resetForm();
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
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
    setIsDialogOpen(true);
  };

  const handleDelete = async (department: Department) => {
    try {
      await deleteDepartment(department.id);
      toast({
        title: "Success!",
        description: "Department deleted successfully",
      });
      loadDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete department",
        variant: "destructive",
      });
    }
  };

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
    setEditingDepartment(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600">Manage university departments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter department name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Department Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Enter department code (e.g., CS, ENG)"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter department description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="head">Head of Department</Label>
                <Input
                  id="head"
                  value={formData.head_of_department}
                  onChange={(e) => setFormData(prev => ({ ...prev, head_of_department: e.target.value }))}
                  placeholder="Enter head of department name"
                />
              </div>
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="Enter contact email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="Enter contact phone"
                />
              </div>
              <div>
                <Label htmlFor="building">Building</Label>
                <Input
                  id="building"
                  value={formData.building}
                  onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                  placeholder="Enter building name"
                />
              </div>
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                  placeholder="Enter floor number"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {editingDepartment ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {departments.map((department) => (
            <Card key={department.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  {department.name}
                </CardTitle>
                <div className="text-sm text-gray-600 font-mono">{department.code}</div>
              </CardHeader>
              <CardContent className="space-y-3">
                {department.description && (
                  <p className="text-sm text-gray-600">{department.description}</p>
                )}
                {department.head_of_department && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Head of Department</p>
                    <p className="text-sm">{department.head_of_department}</p>
                  </div>
                )}
                {department.contact_email && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <p className="text-sm">{department.contact_email}</p>
                  </div>
                )}
                {department.building && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">Location</p>
                    <p className="text-sm">
                      {department.building}{department.floor && `, Floor ${department.floor}`}
                    </p>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Created: {new Date(department.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(department)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You won't be able to revert this! Department "{department.name}" will be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(department)} className="bg-red-600 hover:bg-red-700">
                          Yes, delete it!
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
