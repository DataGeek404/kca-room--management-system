
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getMyBookings, cancelBooking, Booking } from "@/services/bookingService";
import { Calendar, Clock, MapPin } from "lucide-react";
import moment from 'moment';

export const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      if (response.success && response.data) {
        // Filter out completed bookings on frontend as well
        const activeBookings = response.data.filter(booking => 
          booking.status !== 'completed' || moment(booking.end_time).isAfter(moment())
        );
        setBookings(activeBookings);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    
    // Set up interval to refresh bookings every 5 minutes to handle automatic cleanup
    const interval = setInterval(loadBookings, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCancelBooking = async (booking: Booking) => {
    if (!confirm(`Are you sure you want to cancel "${booking.title}"?`)) return;

    try {
      await cancelBooking(booking.id);
      toast({
        title: "Success",
        description: "Booking cancelled successfully"
      });
      loadBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel booking",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterBookings = (status?: string) => {
    const now = moment();
    
    if (!status) return bookings;
    if (status === 'active') {
      return bookings.filter(b => 
        ['confirmed', 'pending'].includes(b.status) && 
        moment(b.end_time).isAfter(now)
      );
    }
    if (status === 'upcoming') {
      return bookings.filter(b => 
        b.status === 'confirmed' && 
        moment(b.start_time).isAfter(now)
      );
    }
    if (status === 'current') {
      return bookings.filter(b => 
        b.status === 'confirmed' && 
        moment(b.start_time).isSameOrBefore(now) && 
        moment(b.end_time).isAfter(now)
      );
    }
    return bookings.filter(b => b.status === status);
  };

  const getStats = () => {
    const now = moment();
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const current = bookings.filter(b => 
      b.status === 'confirmed' && 
      moment(b.start_time).isSameOrBefore(now) && 
      moment(b.end_time).isAfter(now)
    ).length;

    return {
      confirmed,
      pending,
      cancelled,
      current
    };
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const isBookingActive = (booking: Booking) => {
    const now = moment();
    return moment(booking.start_time).isSameOrBefore(now) && 
           moment(booking.end_time).isAfter(now);
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const startDateTime = formatDateTime(booking.start_time);
    const endDateTime = formatDateTime(booking.end_time);
    const isActive = isBookingActive(booking);
    const duration = moment(booking.end_time).diff(moment(booking.start_time), 'hours');

    return (
      <Card className={`hover:shadow-md transition-shadow ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{booking.title}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <MapPin className="w-3 h-3" />
                <span>Room {booking.room_name}</span>
                {booking.building && (
                  <span className="text-gray-400">• {booking.building}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isActive && (
                <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                  Active Now
                </Badge>
              )}
              {booking.recurring && (
                <Badge variant="secondary" className="text-xs">
                  Recurring
                </Badge>
              )}
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-3 h-3 text-gray-500" />
              <span className="font-medium">{startDateTime.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="font-medium">
                {startDateTime.time} - {endDateTime.time}
              </span>
              <span className="text-gray-400">({duration}h duration)</span>
            </div>
            {booking.description && (
              <div className="text-sm text-gray-600 mt-2">
                <p className="line-clamp-2">{booking.description}</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {['confirmed', 'pending'].includes(booking.status) && 
             moment(booking.start_time).isAfter(moment()) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-red-600 hover:text-red-700"
                onClick={() => handleCancelBooking(booking)}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600">Manage your room reservations and schedule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.confirmed}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.current}
            </div>
            <div className="text-sm text-gray-600">Active Now</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.cancelled}
            </div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBookings('active').length > 0 ? (
              filterBookings('active').map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No active bookings found. Create your first booking!
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBookings('upcoming').length > 0 ? (
              filterBookings('upcoming').map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No upcoming bookings found.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="current" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBookings('current').length > 0 ? (
              filterBookings('current').map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No current bookings found.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBookings('cancelled').length > 0 ? (
              filterBookings('cancelled').map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No cancelled bookings found.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.length > 0 ? (
              bookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No bookings found. Create your first booking!
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
