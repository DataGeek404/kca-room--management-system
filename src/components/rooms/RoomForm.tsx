
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateRoomData, Room } from "@/services/roomService";

interface RoomFormProps {
  initialData?: Room;
  onSubmit: (data: CreateRoomData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RoomForm = ({ initialData, onSubmit, onCancel, isLoading }: RoomFormProps) => {
  const [formData, setFormData] = useState<CreateRoomData>({
    name: initialData?.name || "",
    capacity: initialData?.capacity || 0,
    building: initialData?.building || "",
    floor: initialData?.floor || 1,
    resources: initialData?.resources || [],
    description: initialData?.description || ""
  });

  const resourceOptions = [
    "Projector", "Whiteboard", "Smart Board", "Audio System", 
    "Video Conferencing", "Air Conditioning", "Computers", "Microphone"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleResource = (resource: string) => {
    if (formData.resources.includes(resource)) {
      setFormData(prev => ({
        ...prev,
        resources: prev.resources.filter(r => r !== resource)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, resource]
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Room Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., A101"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
            min="1"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="floor">Floor</Label>
          <Input
            id="floor"
            type="number"
            value={formData.floor}
            onChange={(e) => setFormData(prev => ({ ...prev, floor: parseInt(e.target.value) || 1 }))}
            min="1"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="building">Building</Label>
        <Input
          id="building"
          value={formData.building}
          onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
          placeholder="e.g., Main Building"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Resources</Label>
        <div className="grid grid-cols-2 gap-2">
          {resourceOptions.map(resource => (
            <label key={resource} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={formData.resources.includes(resource)}
                onChange={() => toggleResource(resource)}
                className="rounded"
              />
              <span>{resource}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description..."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {initialData ? 'Update' : 'Create'} Room
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
