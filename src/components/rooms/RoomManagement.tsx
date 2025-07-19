
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { getRooms, createRoom, updateRoom, deleteRoom } from '@/services/roomService';
import { RoomForm } from './RoomForm';
import type { Room, CreateRoomData } from '@/services/roomService';

export const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    building: '',
    floor: '',
    capacity: '',
    status: ''
  });
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRooms();
  }, [searchTerm, filters]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await getRooms({
        search: searchTerm || undefined,
        building: filters.building || undefined,
        floor: filters.floor ? parseInt(filters.floor) : undefined,
        capacity: filters.capacity ? parseInt(filters.capacity) : undefined,
        status: filters.status || undefined
      });
      
      if (response.success && response.data) {
        setRooms(response.data);
      } else {
        toast.error(response.message || 'Failed to load rooms');
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: CreateRoomData) => {
    try {
      setSubmitting(true);
      let response;
      
      if (editingRoom) {
        response = await updateRoom(editingRoom.id, formData);
      } else {
        response = await createRoom(formData);
      }
      
      if (response.success) {
        toast.success(editingRoom ? 'Room updated successfully' : 'Room created successfully');
        setShowAddDialog(false);
        setShowEditDialog(false);
        setEditingRoom(null);
        loadRooms();
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting room:', error);
      toast.error('Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (room: Room) => {
    try {
      const response = await deleteRoom(room.id);
      if (response.success) {
        toast.success('Room deleted successfully');
        loadRooms();
      } else {
        toast.error(response.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  const handleStatusChange = async (room: Room, newStatus: string) => {
    try {
      const response = await updateRoom(room.id, { status: newStatus });
      if (response.success) {
        toast.success('Room status updated');
        loadRooms();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setShowEditDialog(true);
  };

  const handleCancel = () => {
    setShowAddDialog(false);
    setShowEditDialog(false);
    setEditingRoom(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'occupied': return 'secondary';
      case 'maintenance': return 'destructive';
      case 'inactive': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Manage rooms, their status, and resources</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Room
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.building} onValueChange={(value) => setFilters(prev => ({ ...prev, building: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                <SelectItem value="Main Building">Main Building</SelectItem>
                <SelectItem value="Science Block">Science Block</SelectItem>
                <SelectItem value="Library">Library</SelectItem>
                <SelectItem value="Student Center">Student Center</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.floor} onValueChange={(value) => setFilters(prev => ({ ...prev, floor: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="1">1st Floor</SelectItem>
                <SelectItem value="2">2nd Floor</SelectItem>
                <SelectItem value="3">3rd Floor</SelectItem>
                <SelectItem value="4">4th Floor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.capacity} onValueChange={(value) => setFilters(prev => ({ ...prev, capacity: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Min Capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Capacity</SelectItem>
                <SelectItem value="10">10+</SelectItem>
                <SelectItem value="20">20+</SelectItem>
                <SelectItem value="50">50+</SelectItem>
                <SelectItem value="100">100+</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Rooms Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription>
                      {room.building && room.floor ? `${room.building}, Floor ${room.floor}` : room.location}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(room.status)}>
                    {room.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-medium">{room.capacity} people</span>
                  </div>
                  {room.type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{room.type}</span>
                    </div>
                  )}
                  {room.resources && room.resources.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Resources:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {room.resources.slice(0, 3).map((resource, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                        {room.resources.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{room.resources.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {room.description && (
                    <p className="text-muted-foreground text-xs mt-2 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Select value={room.status} onValueChange={(value) => handleStatusChange(room, value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(room)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Room</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{room.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(room)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* No rooms found */}
      {!loading && rooms.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No rooms found matching your criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Add Room Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Create a new room with its details and resources.
            </DialogDescription>
          </DialogHeader>
          <RoomForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update room details and resources.
            </DialogDescription>
          </DialogHeader>
          <RoomForm
            room={editingRoom}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitting={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
