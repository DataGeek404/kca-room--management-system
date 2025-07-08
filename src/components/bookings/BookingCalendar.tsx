import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-big-calendar';
import { momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Booking, getAllBookings, getMyBookings, cancelBooking, createBooking, updateBooking, hardDeleteBooking } from "@/services/bookingService";
import { Room, getRooms } from "@/services/roomService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingForm } from "@/components/bookings/BookingForm";
import { AdminBookingForm } from "@/components/bookings/AdminBookingForm";
import { BookingContextMenu } from "@/components/bookings/BookingContextMenu";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const localizer = momentLocalizer(moment);

interface BookingCalendarProps {
  viewType: "admin" | "user";
  userRole?: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ viewType, userRole }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{start: Date, end: Date} | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
    
    // Set up interval to refresh data every 5 minutes to handle automatic cleanup
    const interval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [viewType]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load bookings based on view type
      const bookingsPromise = viewType === "admin" ? getAllBookings() : getMyBookings();
      const roomsPromise = getRooms();
      
      const [bookingsResponse, roomsResponse] = await Promise.all([
        bookingsPromise,
        roomsPromise
      ]);
      
      if (bookingsResponse.success && bookingsResponse.data) {
        // Filter out completed bookings and format for calendar
        const activeBookings = bookingsResponse.data
          .filter(booking => booking.status !== 'completed')
          .map(booking => ({
            ...booking,
            start: new Date(booking.start_time),
            end: new Date(booking.end_time),
          }));
        setBookings(activeBookings);
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
    setSelectedSlot({ start, end });
    setIsCreateDialogOpen(true);
  };

  const handleEditBooking = (booking?: Booking) => {
    const bookingToEdit = booking || selectedEvent;
    if (bookingToEdit) {
      setEditingBooking(bookingToEdit);
      setIsEditDialogOpen(true);
      setIsDialogOpen(false);
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedEvent(booking);
    setIsDialogOpen(true);
  };

  const handleDeleteBooking = (booking: Booking) => {
    setBookingToDelete(booking);
    setShowDeleteDialog(true);
  };

  const handleDuplicateBooking = (booking: Booking) => {
    // Create a new booking based on the selected one
    const duplicateData = {
      roomId: booking.room_id,
      title: `${booking.title} (Copy)`,
      startTime: moment(booking.start_time).add(1, 'week').toISOString(),
      endTime: moment(booking.end_time).add(1, 'week').toISOString(),
      description: booking.description,
      recurring: booking.recurring
    };
    
    setSelectedSlot({
      start: moment(booking.start_time).add(1, 'week').toDate(),
      end: moment(booking.end_time).add(1, 'week').toDate()
    });
    setIsCreateDialogOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      if (viewType === "admin" && user?.role === 'admin') {
        // Admin can hard delete
        await hardDeleteBooking(bookingToDelete.id);
        toast({
          title: "Success",
          description: "Booking deleted permanently",
        });
      } else {
        // Regular cancel for non-admin users
        await cancelBooking(bookingToDelete.id);
        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        });
      }
      
      setShowDeleteDialog(false);
      setBookingToDelete(null);
      setIsDialogOpen(false);
      setSelectedEvent(null);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete booking",
        variant: "destructive",
      });
    }
  };

  const handleCreateBooking = async (formData: any) => {
    try {
      console.log('Creating booking with form data:', formData);
      
      const bookingData = {
        roomId: formData.roomId,
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description,
        recurring: formData.recurring
      };

      const response = await createBooking(bookingData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Booking created successfully",
        });
        
        setIsCreateDialogOpen(false);
        setSelectedSlot(null);
        loadData();
      }
    } catch (error) {
      console.error('Create booking error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create booking",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBooking = async (formData: any) => {
    if (!editingBooking) return;
    
    try {
      console.log('Updating booking with form data:', formData);
      
      const bookingData = {
        roomId: formData.roomId,
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description,
        recurring: formData.recurring
      };

      const response = await updateBooking(editingBooking.id, bookingData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Booking updated successfully",
        });
        
        setIsEditDialogOpen(false);
        setEditingBooking(null);
        loadData();
      }
    } catch (error) {
      console.error('Update booking error:', error);
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
    const now = moment();
    const eventStart = moment(start);
    const eventEnd = moment(end);
    
    let backgroundColor = 'hsl(var(--primary))';
    
    // Check if booking is currently active
    if (eventStart.isSameOrBefore(now) && eventEnd.isAfter(now)) {
      backgroundColor = 'hsl(142, 76%, 36%)'; // Active green
    } else if (event.status === 'pending') {
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

  const canEditBooking = (booking: Booking) => {
    if (!user) return false;
    
    // Admin can edit all bookings
    if (viewType === "admin" && user.role === 'admin') {
      return true;
    }
    
    // Users can only edit their own bookings
    return viewType === "user" && booking.user_id === user.id;
  };

  const isBookingEditable = (booking: Booking) => {
    // Can only edit future bookings
    return moment(booking.start_time).isAfter(moment());
  };

  const EventComponent = ({ event }: { event: Booking }) => {
    const isAdmin = viewType === "admin" && user?.role === 'admin';
    const canEdit = canEditBooking(event) && isBookingEditable(event);

    return (
      <BookingContextMenu
        booking={event}
        isAdmin={isAdmin}
        canEdit={canEdit}
        onView={() => handleViewBooking(event)}
        onEdit={() => handleEditBooking(event)}
        onDelete={() => handleDeleteBooking(event)}
        onDuplicate={() => handleDuplicateBooking(event)}
      >
        <div className="h-full w-full">
          {event.title}
        </div>
      </BookingContextMenu>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          {viewType === "admin" ? "Booking Calendar (Admin)" : "My Bookings Calendar"}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }}></div>
            <span>Active</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
            <span>Confirmed</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--warning))' }}></div>
            <span>Pending</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
            <span>Cancelled</span>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Booking
          </Button>
        </div>
      </div>

      {viewType === "admin" && (
        <div className="bg-muted/50 p-3 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            <strong>Admin Mode:</strong> Right-click on any booking to access edit, delete, and duplicate options.
          </p>
        </div>
      )}

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
            selectable={true}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent
            }}
            className="rbc-calendar-custom"
            step={60}
            showMultiDayTimes
            defaultView="week"
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
                {viewType === "admin" && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">User:</span>
                    <p className="text-sm font-medium">{selectedEvent.user_name}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Start Time:</span>
                  <p className="text-sm">{moment(selectedEvent.start_time).format('MMMM Do YYYY, h:mm a')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">End Time:</span>
                  <p className="text-sm">{moment(selectedEvent.end_time).format('MMMM Do YYYY, h:mm a')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Duration:</span>
                  <p className="text-sm">{moment(selectedEvent.end_time).diff(moment(selectedEvent.start_time), 'hours')} hours</p>
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
                <Button variant="outline" onClick={handleCloseDialog}>
                  Close
                </Button>
                {canEditBooking(selectedEvent) && isBookingEditable(selectedEvent) && (
                  <>
                    <Button variant="secondary" onClick={() => handleEditBooking()} className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteBooking(selectedEvent)} className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      {viewType === "admin" ? "Delete" : "Cancel"}
                    </Button>
                  </>
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
          {viewType === "admin" ? (
            <AdminBookingForm
              rooms={rooms}
              onSubmit={handleCreateBooking}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                setSelectedSlot(null);
              }}
              initialSlot={selectedSlot}
            />
          ) : (
            <BookingForm
              rooms={rooms}
              onSubmit={handleCreateBooking}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                setSelectedSlot(null);
              }}
              initialSlot={selectedSlot}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Booking</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            viewType === "admin" ? (
              <AdminBookingForm
                rooms={rooms}
                onSubmit={handleUpdateBooking}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingBooking(null);
                }}
                initialBooking={editingBooking}
              />
            ) : (
              <BookingForm
                rooms={rooms}
                onSubmit={handleUpdateBooking}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingBooking(null);
                }}
                initialBooking={editingBooking}
              />
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {viewType === "admin" ? "Delete Booking" : "Cancel Booking"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {viewType === "admin" 
                ? "Are you sure you want to permanently delete this booking? This action cannot be undone."
                : "Are you sure you want to cancel this booking?"
              }
              {bookingToDelete && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <strong>{bookingToDelete.title}</strong><br/>
                  {moment(bookingToDelete.start_time).format('MMMM Do YYYY, h:mm a')}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBooking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {viewType === "admin" ? "Delete" : "Cancel Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
