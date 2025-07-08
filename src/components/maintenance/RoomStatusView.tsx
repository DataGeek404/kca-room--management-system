
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const RoomStatusView = () => {
  const rooms = [
    {
      id: "1",
      name: "A101",
      building: "Building A",
      floor: 1,
      status: "maintenance",
      issue: "Projector repair in progress",
      lastMaintenance: "2024-07-08"
    },
    {
      id: "2",
      name: "A102",
      building: "Building A",
      floor: 1,
      status: "available",
      issue: null,
      lastMaintenance: "2024-07-01"
    },
    {
      id: "3",
      name: "B205",
      building: "Building B",
      floor: 2,
      status: "available",
      issue: null,
      lastMaintenance: "2024-07-03"
    },
    {
      id: "4",
      name: "C301",
      building: "Building C",
      floor: 3,
      status: "maintenance",
      issue: "Air conditioning repair",
      lastMaintenance: "2024-07-07"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
              {rooms.filter(r => r.status === 'available').length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {rooms.filter(r => r.status === 'maintenance').length}
            </div>
            <div className="text-sm text-gray-600">Under Maintenance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">0</div>
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
        {rooms.map((room) => (
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
              {room.issue && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Current Issue:</strong> {room.issue}
                  </p>
                </div>
              )}
              
              <div className="text-sm">
                <p className="text-gray-500">Last Maintenance:</p>
                <p className="font-medium">{formatDate(room.lastMaintenance)}</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View History
                </Button>
                {room.status === 'available' && (
                  <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700">
                    Flag Issue
                  </Button>
                )}
                {room.status === 'maintenance' && (
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    Mark Fixed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
