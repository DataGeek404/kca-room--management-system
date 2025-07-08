
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Room, getRooms, createRoom, updateRoom, deleteRoom, CreateRoomData } from "@/services/roomService";
import { RoomCard } from "./RoomCard";
import { RoomForm } from "./RoomForm";
import { RoomFilters } from "./RoomFilters";

export const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const loadRooms = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        building: buildingFilter === "all" ? undefined : buildingFilter,
        status: statusFilter === "all" ? undefined : statusFilter
      };
      const response = await getRooms(params);
      if (response.success && response.data) {
        setRooms(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load rooms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, [searchTerm, buildingFilter, statusFilter]);

  const handleSubmit = async (formData: CreateRoomData) => {
    try {
      setIsSubmitting(true);
      if (editingRoom) {
        await updateRoom(editingRoom.id, formData);
        toast({
          title: "Success",
          description: "Room updated successfully"
        });
        setIsEditDialogOpen(false);
      } else {
        await createRoom(formData);
        toast({
          title: "Success",
          description: "Room created successfully"
        });
        setIsAddDialogOpen(false);
      }
      
      setEditingRoom(null);
      loadRooms();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (room: Room) => {
    if (!confirm(`Are you sure you want to delete room ${room.name}?`)) return;
    
    try {
      await deleteRoom(room.id);
      toast({
        title: "Success",
        description: "Room deleted successfully"
      });
      loadRooms();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete room",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (room: Room, newStatus: string) => {
    try {
      await updateRoom(room.id, { status: newStatus });
      toast({
        title: "Success",
        description: "Room status updated successfully"
      });
      loadRooms();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setIsEditDialogOpen(true);
  };

  const handleCancel = () => {
    setEditingRoom(null);
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600">Manage university classroom facilities</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Room</DialogTitle>
            </DialogHeader>
            <RoomForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <RoomFilters
        searchTerm={searchTerm}
        buildingFilter={buildingFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onBuildingChange={setBuildingFilter}
        onStatusChange={setStatusFilter}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          {editingRoom && (
            <RoomForm
              initialData={editingRoom}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
