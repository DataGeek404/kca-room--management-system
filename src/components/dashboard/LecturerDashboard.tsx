import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoomBrowser } from "@/components/rooms/RoomBrowser";
import { BookingForm } from "@/components/bookings/BookingForm";
import { MyBookings } from "@/components/bookings/MyBookings";
import { getRooms } from "@/services/roomService";
import { createBooking, getMyBookings } from "@/services/bookingService";
import { Room } from "@/services/roomService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LecturerDashboardProps {
  activeView: string;
}

export const LecturerDashboard = ({ activeView }: LecturerDashboardProps) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    weeklyBookingsCount: 0,
    availableRoomsCount: 0,
    nextBooking: null as any,
    upcomingBookings: [] as any[],
    availableRooms: [] as any[]
  });

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || (activeView && activeView !== 'overview')) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user's bookings and rooms in parallel
        const [bookingsResponse, roomsResponse] = await Promise.all([
          getMyBookings(),
          getRooms()
        ]);

        if (bookingsResponse.success && bookingsResponse.data) {
          const userBookings = bookingsResponse.data;
          setBookings(userBookings);

          // Calculate weekly bookings count
          const now = new Date();
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          
          const weeklyBookings = userBookings.filter((booking: any) => {
            const bookingDate = new Date(booking.start_time);
            return bookingDate >= weekStart && bookingDate <= weekEnd;
          });

          // Get upcoming bookings (next 3)
          const upcomingBookings = userBookings
            .filter((booking: any) => new Date(booking.start_time) >= new Date())
            .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
            .slice(0, 3);

          // Get next booking
          const nextBooking = upcomingBookings[0] || null;

          setDashboardData(prev => ({
            ...prev,
            weeklyBookingsCount: weeklyBookings.length,
            nextBooking,
            upcomingBookings
          }));
        }

        if (roomsResponse.success && roomsResponse.data) {
          const availableRooms = roomsResponse.data.filter((room: any) => 
            room.status === 'available'
          );
          
          setDashboardData(prev => ({
            ...prev,
            availableRoomsCount: availableRooms.length,
            availableRooms: availableRooms.slice(0, 3) // Show top 3 for quick booking
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeView, user]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
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
            <div className="text-3xl font-bold">
              {isLoading ? '...' : dashboardData.weeklyBookingsCount}
            </div>
            <p className="text-blue-100 text-sm">This week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Available Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? '...' : dashboardData.availableRoomsCount}
            </div>
            <p className="text-green-100 text-sm">Right now</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Next Class</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-xl font-bold">...</div>
            ) : dashboardData.nextBooking ? (
              <>
                <div className="text-xl font-bold">Room {dashboardData.nextBooking.room_name}</div>
                <p className="text-purple-100 text-sm">
                  {new Date(dashboardData.nextBooking.start_time).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })} - {new Date(dashboardData.nextBooking.end_time).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })}
                </p>
              </>
            ) : (
              <>
                <div className="text-xl font-bold">No classes</div>
                <p className="text-purple-100 text-sm">scheduled</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : dashboardData.upcomingBookings.length > 0 ? (
              dashboardData.upcomingBookings.map((booking: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{booking.title || booking.purpose || 'Class'}</p>
                    <p className="text-sm text-gray-600">Room {booking.room_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatDate(booking.start_time)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.start_time).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })} - {new Date(booking.end_time).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">No upcoming bookings</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Book</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {isLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : dashboardData.availableRooms.length > 0 ? (
                dashboardData.availableRooms.map((room: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{room.name}</div>
                        <div className="text-sm text-gray-600">{room.capacity} seats</div>
                        <div className="text-xs text-gray-500">{room.features || 'Standard equipment'}</div>
                      </div>
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Available
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">No available rooms</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
