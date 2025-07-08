
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookingCalendarProps {
  viewType?: 'admin' | 'lecturer';
}

export const BookingCalendar = ({ viewType = 'lecturer' }: BookingCalendarProps) => {
  // Mock booking data
  const bookings = [
    {
      id: "1",
      roomId: "1",
      roomName: "A101",
      title: "Computer Science 101",
      userName: "Prof. Johnson",
      startTime: "09:00",
      endTime: "11:00",
      date: "2024-07-08",
      status: "confirmed"
    },
    {
      id: "2",
      roomId: "2",
      roomName: "B205",
      title: "Data Structures",
      userName: "Dr. Smith",
      startTime: "14:00",
      endTime: "16:00",
      date: "2024-07-08",
      status: "confirmed"
    },
    {
      id: "3",
      roomId: "1",
      roomName: "A101",
      title: "Algorithms Workshop",
      userName: "Prof. Davis",
      startTime: "10:00",
      endTime: "12:00",
      date: "2024-07-09",
      status: "pending"
    }
  ];

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const rooms = ["A101", "B205", "C301"];

  const getBookingForSlot = (room: string, time: string) => {
    return bookings.find(booking => 
      booking.roomName === room && 
      booking.startTime <= time && 
      booking.endTime > time &&
      booking.date === "2024-07-08" // Today for demo
    );
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

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule - July 8, 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[100px_repeat(3,1fr)] gap-2 min-w-[600px]">
              {/* Header */}
              <div className="font-medium text-gray-700 p-2">Time</div>
              {rooms.map(room => (
                <div key={room} className="font-medium text-gray-700 p-2 text-center">
                  Room {room}
                </div>
              ))}

              {/* Time slots */}
              {timeSlots.map(time => (
                <div key={time} className="contents">
                  <div className="p-2 text-sm text-gray-600 border-t">
                    {time}
                  </div>
                  {rooms.map(room => {
                    const booking = getBookingForSlot(room, time);
                    return (
                      <div key={`${room}-${time}`} className="p-1 border-t border-l min-h-[60px]">
                        {booking ? (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 h-full">
                            <div className="text-xs font-medium text-blue-900 truncate">
                              {booking.title}
                            </div>
                            <div className="text-xs text-blue-700 truncate">
                              {booking.userName}
                            </div>
                            <div className="text-xs text-blue-600">
                              {booking.startTime}-{booking.endTime}
                            </div>
                            <Badge className={`${getStatusColor(booking.status)} text-xs mt-1`}>
                              {booking.status}
                            </Badge>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-xs text-gray-400">
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
            {bookings.slice(0, 5).map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{booking.title}</p>
                  <p className="text-sm text-gray-600">
                    Room {booking.roomName} • {booking.userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.startTime} - {booking.endTime}
                  </p>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rooms.map(room => {
              const roomBookings = bookings.filter(b => b.roomName === room && b.date === "2024-07-08");
              const availableSlots = timeSlots.length - roomBookings.length;
              
              return (
                <div key={room} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Room {room}</p>
                    <p className="text-sm text-gray-600">
                      {roomBookings.length} bookings today
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {availableSlots} slots available
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round((availableSlots / timeSlots.length) * 100)}% free
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
