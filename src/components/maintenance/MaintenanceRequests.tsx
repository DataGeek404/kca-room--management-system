
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Wrench, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { MaintenanceRequest, getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest } from "@/services/maintenanceService";
import { Room, getRooms } from "@/services/roomService";

// Define proper types for form data
interface CreateFormData {
  roomId: string;
  issue: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
}

interface UpdateFormData {
  status: 'pending' | 'in-progress' | 'completed';
  notes: string;
}

export const MaintenanceRequests = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [createFormData, setCreateFormData] = useState<CreateFormData>({
    roomId: "",
    issue: "",
    priority: "medium",
    description: ""
  });

  const [updateFormData, setUpdateFormData] = useState<UpdateFormData>({
    status: "pending",
    notes: ""
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter
      };
      const response = await getMaintenanceRequests(params);
      if (response.success && response.data) {
        setRequests(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load maintenance requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await getRooms();
      if (response.success && response.data) {
        setRooms(response.data);
      }
    } catch (error) {
      console.error("Failed to load rooms:", error);
    }
  };

  useEffect(() => {
    loadRequests();
    loadRooms();
  }, [statusFilter, priorityFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.roomId || !createFormData.issue) return;

    try {
      setIsSubmitting(true);
      await createMaintenanceRequest({
        roomId: parseInt(createFormData.roomId),
        issue: createFormData.issue,
        priority: createFormData.priority,
        description: createFormData.description || undefined
      });
      
      toast({
        title: "Success",
        description: "Maintenance request created successfully"
      });
      
      setIsCreateDialogOpen(false);
      setCreateFormData({ roomId: "", issue: "", priority: "medium", description: "" });
      loadRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create request",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setIsSubmitting(true);
      await updateMaintenanceRequest(selectedRequest.id, {
        status: updateFormData.status,
        notes: updateFormData.notes || undefined
      });
      
      toast({
        title: "Success",
        description: "Maintenance request updated successfully"
      });
      
      setIsUpdateDialogOpen(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update request",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUpdateDialog = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setUpdateFormData({
      status: request.status,
      notes: request.notes || ""
    });
    setIsUpdateDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Wrench className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-600">Manage facility maintenance and repairs</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <Label htmlFor="room">Room *</Label>
                <Select 
                  value={createFormData.roomId} 
                  onValueChange={(value) => setCreateFormData(prev => ({ ...prev, roomId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.name} - {room.building} Floor {room.floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="issue">Issue *</Label>
                <Input
                  id="issue"
                  value={createFormData.issue}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, issue: e.target.value }))}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={createFormData.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setCreateFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the issue"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  Create Request
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg">{request.issue}</CardTitle>
                  <div className="flex gap-1">
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Room</p>
                  <p className="text-sm text-gray-600">
                    {request.room_name} - {request.building} Floor {request.floor}
                  </p>
                </div>
                {request.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">Reported by</p>
                  <p className="text-sm text-gray-600">{request.reported_by_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                {request.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Notes</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{request.notes}</p>
                  </div>
                )}
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => openUpdateDialog(request)}
                >
                  Update Status
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Update Maintenance Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <Label>Request: {selectedRequest.issue}</Label>
                <p className="text-sm text-gray-600">
                  {selectedRequest.room_name} - {selectedRequest.building} Floor {selectedRequest.floor}
                </p>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={updateFormData.status} 
                  onValueChange={(value: 'pending' | 'in-progress' | 'completed') => 
                    setUpdateFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={updateFormData.notes}
                  onChange={(e) => setUpdateFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about the maintenance work"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  Update Request
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUpdateDialogOpen(false)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
