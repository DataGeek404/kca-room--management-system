
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getRooms, Room } from "@/services/roomService";
import { createBooking, CreateBookingData } from "@/services/bookingService";

export const BookingForm = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    roomId: "",
    date: "",
    startTime: "",
    endTime: "",
    title: "",
    description: "",
    recurring: false
  });

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await getRooms({ status: 'available' });
        if (response.success && response.data) {
          setRooms(response.data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load available rooms",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomId || !formData.date || !formData.startTime || !formData.endTime || !formData.title) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate time logic
    if (formData.startTime >= formData.endTime) {
      toast({
        title: "Validation Error",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const startDateTime = `${formData.date}T${formData.startTime}:00`;
      const endDateTime = `${formData.date}T${formData.endTime}:00`;

      const bookingData: CreateBookingData = {
        roomId: parseInt(formData.roomId),
        title: formData.title,
        startTime: startDateTime,
        endTime: endDateTime,
        recurring: formData.recurring,
        description: formData.description || undefined
      };

      const response = await createBooking(bookingData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Booking created successfully"
        });
        
        // Reset form
        setFormData({
          roomId: "",
          date: "",
          startTime: "",
          endTime: "",
          title: "",
          description: "",
          recurring: false
        });
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoom = rooms.find(room => room.id.toString() === formData.roomId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book a Room</h1>
        <p className="text-gray-600">Schedule your classroom or meeting space</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">Select Room *</Label>
                {loading ? (
                  <div className="h-10 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-sm text-gray-500">Loading rooms...</span>
                  </div>
                ) : (
                  <Select value={formData.roomId} onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map(room => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          Room {room.name} - {room.building} (Cap: {room.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Computer Science 101 Lecture"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Additional details about your booking..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="recurring">This is a recurring booking</Label>
            </div>

            {selectedRoom && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Selected Room Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Location:</span>
                      <p className="font-medium">{selectedRoom.building}, Floor {selectedRoom.floor}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Capacity:</span>
                      <p className="font-medium">{selectedRoom.capacity} people</p>
                    </div>
                    {selectedRoom.resources && selectedRoom.resources.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-blue-700">Resources:</span>
                        <p className="font-medium">{selectedRoom.resources.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
              >
                {submitting ? "Creating Booking..." : "Submit Booking Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Bookings must be made at least 24 hours in advance</li>
            <li>Maximum booking duration is 4 hours per session</li>
            <li>Recurring bookings require approval from administration</li>
            <li>Cancellations must be made at least 2 hours before the scheduled time</li>
            <li>Room setup and cleanup time is included in your booking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
