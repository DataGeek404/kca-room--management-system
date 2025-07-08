import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomBrowser } from "@/components/rooms/RoomBrowser";
import { BookingForm } from "@/components/bookings/BookingForm";
import { MyBookings } from "@/components/bookings/MyBookings";
import { getRooms } from "@/services/roomService";
import { createBooking } from "@/services/bookingService";
import { Room } from "@/services/roomService";
import { toast } from "sonner";

interface LecturerDashboardProps {
  activeView: string;
}

export const LecturerDashboard = ({ activeView }: LecturerDashboardProps) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const response = await getRooms();
        if (response.success && response.data) {
          setRooms(response.data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
        toast.error('Failed to load rooms');
      } finally {
        setIsLoading(false);
      }
    };

    if (activeView === 'book') {
      fetchRooms();
    }
  }, [activeView]);

  const handleBookingSubmit = async (data: any) => {
    try {
      const response = await createBooking(data);
      if (response.success) {
        toast.success('Booking request submitted successfully');
      } else {
        toast.error(response.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking');
    }
  };

  const handleBookingCancel = () => {
    // Handle cancel action if needed
    console.log('Booking cancelled');
  };

  if (activeView === "browse") {
    return <RoomBrowser />;
  }
  
  if (activeView === "book") {
    return (
      <BookingForm 
        rooms={rooms}
        onSubmit={handleBookingSubmit}
        onCancel={handleBookingCancel}
      />
    );
  }
  
  if (activeView === "mybookings") {
    return <MyBookings />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7</div>
            <p className="text-blue-100 text-sm">This week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
            <p className="text-green-100 text-sm">Right now</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Next Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">A101</div>
            <p className="text-purple-100 text-sm">2:00 PM - 4:00 PM</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { room: "A101", time: "2:00 PM - 4:00 PM", date: "Today", subject: "Computer Science 101" },
              { room: "B205", time: "10:00 AM - 12:00 PM", date: "Tomorrow", subject: "Data Structures" },
              { room: "C301", time: "9:00 AM - 11:00 AM", date: "Wednesday", subject: "Algorithms" },
            ].map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{booking.subject}</p>
                  <p className="text-sm text-gray-600">Room {booking.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                  <p className="text-xs text-gray-500">{booking.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Book</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {[
                { room: "A101", capacity: "50 seats", features: "Projector, Whiteboard" },
                { room: "B205", capacity: "30 seats", features: "Smart Board, Audio" },
                { room: "C301", capacity: "80 seats", features: "Projector, Microphone" },
              ].map((room, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">Room {room.room}</div>
                      <div className="text-sm text-gray-600">{room.capacity}</div>
                      <div className="text-xs text-gray-500">{room.features}</div>
                    </div>
                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Available
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
