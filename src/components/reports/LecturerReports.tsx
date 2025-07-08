
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getMyBookings, Booking } from "@/services/bookingService";
import { Calendar, Clock, MapPin, TrendingUp } from "lucide-react";

export const LecturerReports = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load booking data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const getBookingStats = () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const thisMonthBookings = bookings.filter(b => 
      new Date(b.created_at) >= thisMonth && b.status === 'confirmed'
    );
    
    const lastMonthBookings = bookings.filter(b => 
      new Date(b.created_at) >= lastMonth && 
      new Date(b.created_at) < thisMonth && 
      b.status === 'confirmed'
    );

    const totalHours = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((acc, booking) => {
        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);

    const uniqueRooms = new Set(bookings.map(b => b.room_id)).size;

    return {
      thisMonth: thisMonthBookings.length,
      lastMonth: lastMonthBookings.length,
      totalHours: Math.round(totalHours),
      uniqueRooms,
      totalBookings: bookings.filter(b => b.status === 'confirmed').length
    };
  };

  const getRoomUsage = () => {
    const roomUsage = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((acc, booking) => {
        const roomKey = `${booking.room_name} (${booking.building})`;
        if (!acc[roomKey]) {
          acc[roomKey] = { count: 0, hours: 0 };
        }
        acc[roomKey].count++;
        
        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        acc[roomKey].hours += hours;
        
        return acc;
      }, {} as Record<string, { count: number; hours: number }>);

    return Object.entries(roomUsage)
      .map(([room, data]) => ({
        room,
        bookings: data.count,
        hours: Math.round(data.hours * 10) / 10
      }))
      .sort((a, b) => b.bookings - a.bookings);
  };

  const getRecentActivity = () => {
    return bookings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  const stats = getBookingStats();
  const roomUsage = getRoomUsage();
  const recentActivity = getRecentActivity();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

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
        <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
        <p className="text-gray-600">Personal booking statistics and room usage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-xs">
              {stats.thisMonth > stats.lastMonth ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : null}
              <span className="text-gray-500">
                {stats.lastMonth} last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalHours}</p>
              </div>
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Room usage time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Rooms</p>
                <p className="text-2xl font-bold text-purple-600">{stats.uniqueRooms}</p>
              </div>
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Different locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalBookings}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Confirmed only</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Room Usage</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Room Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {roomUsage.length > 0 ? (
                <div className="space-y-4">
                  {roomUsage.map((room, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{room.room}</p>
                        <p className="text-sm text-gray-600">{room.bookings} bookings • {room.hours} hours</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{room.bookings}</div>
                        <div className="text-xs text-gray-500">bookings</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No room usage data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{booking.title}</p>
                        <p className="text-sm text-gray-600">
                          Room {booking.room_name} • {formatDate(booking.start_time)} at {formatTime(booking.start_time)}
                        </p>
                      </div>
                      <Badge className={
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
