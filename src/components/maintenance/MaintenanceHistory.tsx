
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const MaintenanceHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const history = [
    {
      id: "1",
      roomName: "A101",
      issue: "Two desk chairs had broken wheels - replaced with new ergonomic chairs",
      priority: "medium",
      reportedBy: "Maintenance Staff",
      reportedAt: "2024-07-06T11:00:00Z",
      completedAt: "2024-07-07T16:30:00Z",
      technician: "Mike Johnson",
      cost: 150
    },
    {
      id: "2",
      roomName: "B205",
      issue: "Smart board calibration and software update completed",
      priority: "low",
      reportedBy: "Prof. Davis",
      reportedAt: "2024-07-05T09:15:00Z",
      completedAt: "2024-07-05T14:20:00Z",
      technician: "Sarah Tech",
      cost: 0
    },
    {
      id: "3",
      roomName: "C301",
      issue: "Complete HVAC system servicing and filter replacement",
      priority: "high",
      reportedBy: "Admin Office",
      reportedAt: "2024-07-01T08:00:00Z",
      completedAt: "2024-07-02T17:45:00Z",
      technician: "External Contractor",
      cost: 450
    },
    {
      id: "4",
      roomName: "A102", 
      issue: "Projector lamp replacement and lens cleaning",
      priority: "medium",
      reportedBy: "Prof. Johnson",
      reportedAt: "2024-06-28T13:30:00Z",
      completedAt: "2024-06-29T10:15:00Z",
      technician: "Mike Johnson",
      cost: 85
    }
  ];

  const filteredHistory = history.filter(item =>
    item.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.technician.toLowerCase().includes(searchTerm.toLowerCase())
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffHours = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hours`;
    } else {
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return `${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours}h` : ''}`;
    }
  };

  const totalCost = history.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Maintenance History</h1>
        <p className="text-gray-600">Complete record of all completed maintenance work</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{history.length}</div>
            <div className="text-sm text-gray-600">Total Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${totalCost.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Cost</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(history.reduce((sum, item) => {
                const duration = calculateDuration(item.reportedAt, item.completedAt);
                return sum + parseInt(duration);
              }, 0) / history.length)}h
            </div>
            <div className="text-sm text-gray-600">Avg Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(history.map(h => h.roomName)).size}
            </div>
            <div className="text-sm text-gray-600">Rooms Serviced</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by room, issue, or technician..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Room {item.roomName}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Completed by {item.technician}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority.toUpperCase()}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    COMPLETED
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Work Performed</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{item.issue}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Reported</p>
                  <p className="font-medium">{formatDate(item.reportedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Completed</p>
                  <p className="font-medium">{formatDate(item.completedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium">
                    {calculateDuration(item.reportedAt, item.completedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Cost</p>
                  <p className="font-medium">
                    {item.cost > 0 ? `$${item.cost}` : 'No Cost'}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Reported by:</strong> {item.reportedBy}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No maintenance history found</p>
          <p className="text-gray-400">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
};
