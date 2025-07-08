
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit, Trash2 } from "lucide-react";
import { Room } from "@/services/roomService";

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onStatusChange: (room: Room, newStatus: string) => void;
}

export const RoomCard = ({ room, onEdit, onDelete, onStatusChange }: RoomCardProps) => {
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Room {room.name}</CardTitle>
            <p className="text-gray-600">{room.building}, Floor {room.floor}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(room.status)}>
              {room.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Capacity</p>
          <p className="font-medium">{room.capacity} people</p>
        </div>
        
        {room.resources && room.resources.length > 0 && (
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
        )}
        
        {room.description && (
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-sm text-gray-700">{room.description}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm text-gray-500">Update Status</Label>
          <Select 
            value={room.status} 
            onValueChange={(value) => onStatusChange(room, value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="maintenance">Under Maintenance</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(room)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-red-600 hover:text-red-700"
            onClick={() => onDelete(room)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
