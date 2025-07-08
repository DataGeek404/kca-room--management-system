
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MaintenanceRequest, getMaintenanceRequests } from "@/services/maintenanceService";

export const MaintenanceHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await getMaintenanceRequests({ status: 'completed' });
      
      if (response.success && response.data) {
        setHistory(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load maintenance history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = history.filter(item =>
    item.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return 'N/A';
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
              {history.filter(h => h.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {history.length > 0 ? Math.round(
                history.reduce((sum, item) => {
                  const duration = calculateDuration(item.created_at, item.completed_at);
                  const hours = parseInt(duration) || 0;
                  return sum + hours;
                }, 0) / history.length
              ) : 0}h
            </div>
            <div className="text-sm text-gray-600">Avg Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(history.map(h => h.room_name)).size}
            </div>
            <div className="text-sm text-gray-600">Rooms Serviced</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by room, issue, or description..."
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
                  <CardTitle className="text-lg">Room {item.room_name}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Reported by {item.reported_by_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority.toUpperCase()}
                  </Badge>
                  <Badge className="status-completed">
                    COMPLETED
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Issue</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{item.issue}</p>
                {item.description && (
                  <p className="text-gray-600 text-sm mt-2">{item.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Reported</p>
                  <p className="font-medium">{formatDate(item.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Completed</p>
                  <p className="font-medium">
                    {item.completed_at ? formatDate(item.completed_at) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium">
                    {calculateDuration(item.created_at, item.completed_at)}
                  </p>
                </div>
              </div>
              
              {item.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Notes:</strong> {item.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No maintenance history found</p>
          <p className="text-gray-400">
            {searchTerm ? 'Try adjusting your search terms' : 'No completed maintenance requests yet'}
          </p>
        </div>
      )}
    </div>
  );
};
