import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-big-calendar';
import { momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Booking, getAllBookings, cancelBooking } from "@/services/bookingService";
import { Room } from "@/services/roomService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
    let backgroundColor = '#3174ad';
    if (event.status === 'pending') {
      backgroundColor = '#f0ad4e';
    } else if (event.status === 'cancelled') {
      backgroundColor = '#d9534f';
    }

    const style = {
      backgroundColor: backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return {
      style: style
    };
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Booking Calendar</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={bookings}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          style={{ height: 500 }}
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
        />
      )}

      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => handleCloseDialog()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div>
              <p><strong>Room:</strong> {selectedEvent.room_name}</p>
              <p><strong>Start Time:</strong> {moment(selectedEvent.start_time).format('MMMM Do YYYY, h:mm a')}</p>
              <p><strong>End Time:</strong> {moment(selectedEvent.end_time).format('MMMM Do YYYY, h:mm a')}</p>
              <p><strong>Status:</strong> {selectedEvent.status}</p>
              {selectedEvent.description && <p><strong>Description:</strong> {selectedEvent.description}</p>}
            </div>
            <div className="mt-4 flex justify-end">
              {viewType === "admin" ? (
                <Button variant="destructive" onClick={handleCancelBooking}>Cancel Booking</Button>
              ) : (
                <Button variant="outline" onClick={handleCloseDialog}>Close</Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
