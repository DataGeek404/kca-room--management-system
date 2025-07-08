
import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-big-calendar';
import { momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Booking, getAllBookings, cancelBooking } from "@/services/bookingService";
import { Room } from "@/services/roomService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingForm } from "@/components/bookings/BookingForm";

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
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      if (response.success && response.data) {
        const formattedBookings = response.data.map(booking => ({
          ...booking,
          start: new Date(booking.start_time),
          end: new Date(booking.end_time),
        }));
        setBookings(formattedBookings);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load bookings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Booking) => {
    setSelectedEvent(event);
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
      loadBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive",
      });
    } finally {
      setSelectedEvent(null);
    }
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
            <span>Confirmed</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--warning))' }}></div>
            <span>Pending</span>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
            <span>Cancelled</span>
          </div>
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
            eventPropGetter={eventStyleGetter}
            className="rbc-calendar-custom"
          />
        </div>
      )}

      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => handleCloseDialog()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Room:</span>
                  <p className="text-sm font-medium">{selectedEvent.room_name}</p>
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
            </div>
            <div className="flex justify-end gap-2 pt-4">
              {viewType === "admin" ? (
                <>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Close
                  </Button>
                  <Button variant="destructive" onClick={handleCancelBooking}>
                    Cancel Booking
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleCloseDialog}>
                  Close
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
