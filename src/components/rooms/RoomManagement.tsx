
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Room } from "@/types/room";

export const RoomManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data
  const [rooms] = useState<Room[]>([
    {
      id: "1",
      name: "A101",
      capacity: 50,
      building: "Building A",
      floor: 1,
      resources: ["Projector", "Whiteboard", "Audio System"],
      status: "available",
      description: "Large lecture hall with modern equipment"
    },
    {
      id: "2",
      name: "B205",
      capacity: 30,
      building: "Building B",
      floor: 2,
      resources: ["Smart Board", "Video Conferencing", "Audio System"],
      status: "available",
      description: "Medium-sized classroom with smart technology"
    },
    {
      id: "3",
      name: "C301",
      capacity: 80,
      building: "Building C",
      floor: 3,
      resources: ["Projector", "Microphone", "Whiteboard"],
      status: "maintenance",
      description: "Large auditorium for special events"
    }
  ]);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600">Manage university classroom facilities</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Add New Room
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search rooms by name or building..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Room {room.name}</CardTitle>
                  <p className="text-gray-600">{room.building}, Floor {room.floor}</p>
                </div>
                <Badge className={getStatusColor(room.status)}>
                  {room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-medium">{room.capacity} people</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Available Resources</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {room.resources.map((resource, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {room.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm text-gray-700">{room.description}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  View Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
