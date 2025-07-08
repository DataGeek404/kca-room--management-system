
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Room } from "@/types/room";

export const RoomBrowser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");

  // Mock data
  const rooms: Room[] = [
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
      id: "4",
      name: "A102",
      capacity: 25,
      building: "Building A",
      floor: 1,
      resources: ["Projector", "Whiteboard"],
      status: "available",
      description: "Small classroom for seminars"
    }
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = !capacityFilter || 
                           (capacityFilter === "small" && room.capacity <= 30) ||
                           (capacityFilter === "medium" && room.capacity > 30 && room.capacity <= 50) ||
                           (capacityFilter === "large" && room.capacity > 50);
    const matchesBuilding = !buildingFilter || room.building === buildingFilter;
    
    return matchesSearch && matchesCapacity && matchesBuilding && room.status === "available";
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Available Rooms</h1>
        <p className="text-gray-600">Find and book the perfect classroom for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select value={capacityFilter} onValueChange={setCapacityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by capacity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (≤30)</SelectItem>
            <SelectItem value="medium">Medium (31-50)</SelectItem>
            <SelectItem value="large">Large (50+)</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Building A">Building A</SelectItem>
            <SelectItem value="Building B">Building B</SelectItem>
            <SelectItem value="Building C">Building C</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          onClick={() => {
            setSearchTerm("");
            setCapacityFilter("");
            setBuildingFilter("");
          }}
        >
          Clear Filters
        </Button>
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
                <Badge className="bg-green-100 text-green-800">
                  Available
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium">{room.capacity} people</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-green-600">Available Now</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Equipment & Resources</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {room.resources.map((resource, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {room.description && (
                <p className="text-sm text-gray-700">{room.description}</p>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Book Now
                </Button>
                <Button variant="outline" className="flex-1">
                  View Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No rooms match your criteria</p>
          <p className="text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
};
