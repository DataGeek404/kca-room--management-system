
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceRequest } from "@/types/room";

export const MaintenanceRequests = () => {
  const [statusFilter, setStatusFilter] = useState("");
  
  const [requests] = useState<MaintenanceRequest[]>([
    {
      id: "1",
      roomId: "1",
      roomName: "A101",
      issue: "Projector not working - no display output when connected",
      priority: "high",
      status: "pending",
      reportedBy: "Prof. Johnson",
      reportedAt: "2024-07-08T10:30:00Z"
    },
    {
      id: "2",
      roomId: "3",
      roomName: "C301",
      issue: "Air conditioning unit making loud noise and not cooling effectively",
      priority: "high",
      status: "in-progress",
      reportedBy: "Dr. Smith",
      reportedAt: "2024-07-08T08:15:00Z"
    },
    {
      id: "3",
      roomId: "2",
      roomName: "B205",
      issue: "Whiteboard markers dried out, need replacement",
      priority: "low",
      status: "pending",
      reportedBy: "Prof. Davis",
      reportedAt: "2024-07-07T14:20:00Z"
    },
    {
      id: "4",
      roomId: "1",
      roomName: "A101",
      issue: "Two desk chairs have broken wheels",
      priority: "medium",
      status: "completed",
      reportedBy: "Maintenance Staff",
      reportedAt: "2024-07-06T11:00:00Z",
      completedAt: "2024-07-07T16:30:00Z"
    }
  ]);

  const filteredRequests = requests.filter(request => 
    !statusFilter || request.status === statusFilter
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleStatusChange = (requestId: string, newStatus: string) => {
    console.log(`Updating request ${requestId} to status: ${newStatus}`);
    // In a real app, this would update the backend
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
          <p className="text-gray-600">Manage and track facility maintenance issues</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Create New Request
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          onClick={() => setStatusFilter("")}
        >
          Clear Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Room {request.roomName}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Reported by {request.reportedBy} • {formatDate(request.reportedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Issue Description</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{request.issue}</p>
              </div>
              
              {request.completedAt && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Completed:</strong> {formatDate(request.completedAt)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                {request.status === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleStatusChange(request.id, 'in-progress')}
                    >
                      Start Work
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(request.id, 'completed')}
                    >
                      Mark Complete
                    </Button>
                  </>
                )}
                
                {request.status === 'in-progress' && (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusChange(request.id, 'completed')}
                  >
                    Mark Complete
                  </Button>
                )}
                
                <Button variant="outline" size="sm">
                  Add Note
                </Button>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No maintenance requests found</p>
          <p className="text-gray-400">
            {statusFilter ? 'Try changing your filter' : 'All caught up!'}
          </p>
        </div>
      )}
    </div>
  );
};
