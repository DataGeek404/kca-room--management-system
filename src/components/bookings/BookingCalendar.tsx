
import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-big-calendar';
import { momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Booking, getAllBookings, cancelBooking, createBooking } from "@/services/bookingService";
import { Room, getAllRooms } from "@/services/roomService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingForm } from "@/components/bookings/BookingForm";
import { AdminBookingForm } from "@/components/bookings/AdminBookingForm";
import { Plus, Edit, Trash2, Users } from "lucide-react";

const localizer = momentLocalizer(moment);

interface BookingCalendarProps {
  viewType: "admin" | "user";
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ viewType }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{start: Date, end: Date} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsResponse, roomsResponse] = await Promise.all([
        getAllBookings(),
        getAllRooms()
      ]);
      
      if (bookingsResponse.success && bookingsResponse.data) {
        const formattedBookings = bookingsResponse.data.map(booking => ({
          ...booking,
          start: new Date(booking.start_time),
          end: new Date(booking.end_time),
        }));
        setBookings(formattedBookings);
      }
      
      if (roomsResponse.success && roomsResponse.data) {
        setRooms(roomsResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Booking) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (viewType === "admin") {
      setSelectedSlot({ start, end });
      setIsCreateDialogOpen(true);
    }
  };

  const handleEditBooking = () => {
    if (selectedEvent) {
      setEditingBooking(selectedEvent);
      setIsEditDialogOpen(true);
      setIsDialogOpen(false);
    }
  };

  const handleCreateBooking = async (formData: any) => {
    try {
      const bookingData = {
        roomId: formData.roomId,
        title: formData.title,
        startTime: selectedSlot?.start.toISOString() || formData.startTime,
        endTime: selectedSlot?.end.toISOString() || formData.endTime,
        description: formData.description,
        recurring: formData.recurring
      };

      await createBooking(bookingData);
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
      
      setIsCreateDialogOpen(false);
      setSelectedSlot(null);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBooking = async (formData: any) => {
    try {
      // In a real app, you'd have an updateBooking service function
      // For now, we'll show a placeholder message
      toast({
        title: "Info",
        description: "Booking update functionality will be implemented with backend support",
      });
      
      setIsEditDialogOpen(false);
      setEditingBooking(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update booking",
        variant: "destructive",
      });
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedEvent) return;

    if (!confirm(`Are you sure you want to cancel booking "${selectedEvent.title}"?`)) return;

    try {
      await cancelBooking(selectedEvent.id);
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
      setIsDialogOpen(false);
      setSelectedEvent(null);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
    setIsDialogOpen(false);
  };

  const eventStyleGetter = (event: any, start: Date, end: Date, isSelected: boolean) => {
    let backgroundColor = 'hsl(var(--primary))';
    if (event.status === 'pending') {
      backgroundColor = 'hsl(var(--warning))';
    } else if (event.status === 'cancelled') {
      backgroundColor = 'hsl(var(--destructive))';
    }

    const style = {
      backgroundColor: backgroundColor,
      borderRadius: '8px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500'
    };
    return {
      style: style
    };
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Booking Calendar</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
            <span>Confirmed</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--warning))' }}></div>
            <span>Pending</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
            <span>Cancelled</span>
          </div>
          {viewType === "admin" && (
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Booking
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
          <Calendar
            localizer={localizer}
            events={bookings}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            style={{ height: 600 }}
            onSelectEvent={handleEventClick}
            onSelectSlot={handleSelectSlot}
            selectable={viewType === "admin"}
            eventPropGetter={eventStyleGetter}
            className="rbc-calendar-custom"
          />
        </div>
      )}

      {/* View/Edit Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Room:</span>
                  <p className="text-sm font-medium">{selectedEvent.room_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">User:</span>
                  <p className="text-sm font-medium">{selectedEvent.user_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Start Time:</span>
                  <p className="text-sm">{moment(selectedEvent.start_time).format('MMMM Do YYYY, h:mm a')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">End Time:</span>
                  <p className="text-sm">{moment(selectedEvent.end_time).format('MMMM Do YYYY, h:mm a')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <p className={`text-sm font-medium capitalize ${
                    selectedEvent.status === 'confirmed' ? 'text-green-600' :
                    selectedEvent.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {selectedEvent.status}
                  </p>
                </div>
                {selectedEvent.description && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Description:</span>
                    <p className="text-sm">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                {viewType === "admin" ? (
                  <>
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Close
                    </Button>
                    <Button variant="secondary" onClick={handleEditBooking} className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={handleCancelBooking} className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Booking Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Create New Booking</DialogTitle>
          </DialogHeader>
          <AdminBookingForm
            rooms={rooms}
            onSubmit={handleCreateBooking}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setSelectedSlot(null);
            }}
            initialSlot={selectedSlot}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Booking</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <AdminBookingForm
              rooms={rooms}
              onSubmit={handleUpdateBooking}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingBooking(null);
              }}
              initialBooking={editingBooking}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
