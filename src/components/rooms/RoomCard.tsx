
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, MapPin, Users, Wifi, Monitor, Coffee } from "lucide-react";
import { Room } from "@/services/roomService";

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onStatusChange: (room: Room, newStatus: string) => void;
}

export const RoomCard = ({ room, onEdit, onDelete, onStatusChange }: RoomCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          className: 'status-available border',
          label: 'Available'
        };
      case 'maintenance':
        return {
          className: 'status-maintenance border',
          label: 'Maintenance'
        };
      case 'occupied':
        return {
          className: 'status-occupied border',
          label: 'Occupied'
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          label: status
        };
    }
  };

  const getResourceIcon = (resource: string) => {
    const resourceLower = resource.toLowerCase();
    if (resourceLower.includes('wifi') || resourceLower.includes('internet')) return Wifi;
    if (resourceLower.includes('projector') || resourceLower.includes('screen') || resourceLower.includes('monitor')) return Monitor;
    if (resourceLower.includes('coffee') || resourceLower.includes('refreshment')) return Coffee;
    return null;
  };

  const statusConfig = getStatusConfig(room.status);

  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/95">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-foreground mb-1 truncate">
              Room {room.name}
            </CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{room.building}, Floor {room.floor}</span>
            </div>
          </div>
          <Badge className={`${statusConfig.className} px-3 py-1 font-medium flex-shrink-0`}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5 pt-0">
        {/* Capacity */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <Users className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">{room.capacity} People</p>
            <p className="text-xs text-muted-foreground">Maximum capacity</p>
          </div>
        </div>
        
        {/* Resources */}
        {room.resources && room.resources.length > 0 && (
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Available Resources</p>
            <div className="grid grid-cols-1 gap-2">
              {room.resources.map((resource, index) => {
                const IconComponent = getResourceIcon(resource);
                return (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    {IconComponent && <IconComponent className="h-4 w-4 text-primary flex-shrink-0" />}
                    <span className="text-sm text-foreground truncate">{resource}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Description */}
        {room.description && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {room.description}
            </p>
          </div>
        )}

        {/* Status Update */}
        <div className="space-y-3 pt-2 border-t">
          <Label className="text-sm font-medium text-foreground">Update Status</Label>
          <Select 
            value={room.status} 
            onValueChange={(value) => onStatusChange(room, value)}
          >
            <SelectTrigger className="h-10 bg-background border-2 hover:border-primary/50 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-2">
              <SelectItem value="available" className="hover:bg-accent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Available
                </div>
              </SelectItem>
              <SelectItem value="maintenance" className="hover:bg-accent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Under Maintenance
                </div>
              </SelectItem>
              <SelectItem value="occupied" className="hover:bg-accent">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Occupied
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-10 gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            onClick={() => onEdit(room)}
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-10 gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
            onClick={() => onDelete(room)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
