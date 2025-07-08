
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Clock } from "lucide-react";
import { getAllBookings, getMyBookings, Booking } from "@/services/bookingService";
import { getRooms, Room } from "@/services/roomService";

interface BookingCalendarProps {
  viewType?: 'admin' | 'lecturer';
}

export const BookingCalendar = ({ viewType = 'lecturer' }: BookingCalendarProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [bookingsRes, roomsRes] = await Promise.all([
        viewType === 'admin' ? getAllBookings() : getMyBookings(),
        getRooms()
      ]);

      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data);
      }
      
      if (roomsRes.success && roomsRes.data) {
        setRooms(roomsRes.data.slice(0, 5)); // Show top 5 rooms for calendar view
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [viewType]);

  const getBookingForSlot = (roomId: number, time: string) => {
    return bookings.find(booking => {
      const bookingDate = new Date(booking.start_time).toISOString().split('T')[0];
      const bookingStartHour = new Date(booking.start_time).getHours();
      const bookingEndHour = new Date(booking.end_time).getHours();
      const slotHour = parseInt(time.split(':')[0]);
      
      return booking.room_id === roomId && 
             bookingDate === selectedDate &&
             bookingStartHour <= slotHour && 
             bookingEndHour > slotHour &&
             booking.status === 'confirmed';
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.start_time).toISOString().split('T')[0];
    return bookingDate === selectedDate && booking.status === 'confirmed';
  });

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.start_time);
    return bookingDate > new Date() && booking.status === 'confirmed';
  }).slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {viewType === 'admin' ? 'All Bookings' : 'Booking Calendar'}
          </h1>
          <p className="text-gray-600">
            {viewType === 'admin' 
              ? 'View and manage all room bookings' 
              : 'View current room schedules and availability'
            }
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Calendar className="w-5 h-5 text-gray-500" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <span className="text-sm text-gray-600">
          {todayBookings.length} bookings scheduled
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Schedule - {new Date(selectedDate).toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className={`grid gap-2 min-w-[600px]`} style={{ gridTemplateColumns: `100px repeat(${rooms.length}, 1fr)` }}>
              {/* Header */}
              <div className="font-medium text-gray-700 p-2">Time</div>
              {rooms.map(room => (
                <div key={room.id} className="font-medium text-gray-700 p-2 text-center">
                  Room {room.name}
                </div>
              ))}

              {/* Time slots */}
              {timeSlots.map(time => (
                <div key={time} className="contents">
                  <div className="p-2 text-sm text-gray-600 border-t flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {time}
                  </div>
                  {rooms.map(room => {
                    const booking = getBookingForSlot(room.id, time);
                    return (
                      <div key={`${room.id}-${time}`} className="p-1 border-t border-l min-h-[80px]">
                        {booking ? (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 h-full">
                            <div className="text-xs font-medium text-blue-900 truncate">
                              {booking.title}
                            </div>
                            <div className="text-xs text-blue-700 truncate">
                              {booking.user_name}
                            </div>
                            <div className="text-xs text-blue-600">
                              {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                              {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <Badge className={`${getStatusColor(booking.status)} text-xs mt-1`}>
                              {booking.status}
                            </Badge>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-gray-400 hover:bg-gray-50 cursor-pointer rounded">
                            Available
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{booking.title}</p>
                    <p className="text-sm text-gray-600">
                      Room {booking.room_name} • {booking.user_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.start_time).toLocaleDateString()} at {' '}
                      {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming bookings</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Availability Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rooms.map(room => {
              const roomBookings = todayBookings.filter(b => b.room_id === room.id);
              const availableSlots = timeSlots.length - roomBookings.length;
              const utilizationRate = Math.round(((timeSlots.length - availableSlots) / timeSlots.length) * 100);
              
              return (
                <div key={room.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Room {room.name}</p>
                    <p className="text-sm text-gray-600">
                      {roomBookings.length} bookings today
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {availableSlots} slots available
                    </p>
                    <p className="text-xs text-gray-500">
                      {utilizationRate}% utilized
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
