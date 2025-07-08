
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Room, getRooms } from "@/services/roomService";
import { MaintenanceRequest, getMaintenanceRequests, updateMaintenanceRequest } from "@/services/maintenanceService";

export const RoomStatusView = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch rooms and maintenance requests
      const [roomsResponse, maintenanceResponse] = await Promise.all([
        getRooms(),
        getMaintenanceRequests({ status: 'in-progress' })
      ]);

      if (roomsResponse.success && roomsResponse.data) {
        setRooms(roomsResponse.data);
      }

      if (maintenanceResponse.success && maintenanceResponse.data) {
        setMaintenanceRequests(maintenanceResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load room status data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'status-available';
      case 'maintenance':
        return 'status-maintenance';
      case 'occupied':
        return 'status-occupied';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomMaintenanceIssue = (roomId: number) => {
    return maintenanceRequests.find(req => req.room_id === roomId)?.issue;
  };

  const handleMarkFixed = async (roomId: number) => {
    try {
      const request = maintenanceRequests.find(req => req.room_id === roomId);
      if (request) {
        await updateMaintenanceRequest(request.id, {
          status: 'completed',
          notes: 'Marked as fixed from room status view'
        });
        
        toast({
          title: "Success",
          description: "Room marked as fixed successfully"
        });
        
        loadData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const availableRooms = rooms.filter(room => room.status === 'available');
  const maintenanceRooms = rooms.filter(room => room.status === 'maintenance');
  const occupiedRooms = rooms.filter(room => room.status === 'occupied');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Room Status Overview</h1>
        <p className="text-gray-600">Monitor maintenance status of all rooms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {availableRooms.length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {maintenanceRooms.length}
            </div>
            <div className="text-sm text-gray-600">Under Maintenance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {occupiedRooms.length}
            </div>
            <div className="text-sm text-gray-600">Occupied</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{rooms.length}</div>
            <div className="text-sm text-gray-600">Total Rooms</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const currentIssue = getRoomMaintenanceIssue(room.id);
          
          return (
            <Card key={room.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Room {room.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {room.building}, Floor {room.floor}
                    </p>
                  </div>
                  <Badge className={getStatusColor(room.status)}>
                    {room.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentIssue && room.status === 'maintenance' && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Current Issue:</strong> {currentIssue}
                    </p>
                  </div>
                )}
                
                <div className="text-sm">
                  <p className="text-gray-500">Capacity:</p>
                  <p className="font-medium">{room.capacity} people</p>
                </div>
                
                <div className="text-sm">
                  <p className="text-gray-500">Equipment:</p>
                  <p className="font-medium">{room.equipment || 'Basic'}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  {room.status === 'available' && (
                    <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700">
                      Flag Issue
                    </Button>
                  )}
                  {room.status === 'maintenance' && (
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleMarkFixed(room.id)}
                    >
                      Mark Fixed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No rooms found</p>
          <p className="text-gray-400">Please check your room configuration</p>
        </div>
      )}
    </div>
  );
};
