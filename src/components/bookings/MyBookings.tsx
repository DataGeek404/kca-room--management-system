
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const MyBookings = () => {
  const [bookings] = useState([
    {
      id: "1",
      roomName: "A101",
      title: "Computer Science 101",
      date: "2024-07-08",
      startTime: "09:00",
      endTime: "11:00",
      status: "confirmed",
      recurring: false
    },
    {
      id: "2",
      roomName: "B205",
      title: "Data Structures Lab",
      date: "2024-07-09",
      startTime: "14:00",
      endTime: "16:00",
      status: "confirmed",
      recurring: true
    },
    {
      id: "3",
      roomName: "C301",
      title: "Algorithm Workshop",
      date: "2024-07-10",
      startTime: "10:00",
      endTime: "12:00",
      status: "pending",
      recurring: false
    },
    {
      id: "4",
      roomName: "A102",
      title: "Programming Fundamentals",
      date: "2024-07-05",
      startTime: "15:00",
      endTime: "17:00",
      status: "completed",
      recurring: false
    }
  ]);

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
    if (!status) return bookings;
    if (status === 'active') {
      return bookings.filter(b => ['confirmed', 'pending'].includes(b.status));
    }
    return bookings.filter(b => b.status === status);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{booking.title}</h3>
            <p className="text-sm text-gray-600">Room {booking.roomName}</p>
          </div>
          <div className="flex items-center gap-2">
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
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium">{formatDate(booking.date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time:</span>
            <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {booking.status === 'confirmed' && (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                Modify
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                Cancel
              </Button>
            </>
          )}
          {booking.status === 'pending' && (
            <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700">
              Cancel Request
            </Button>
          )}
          {booking.status === 'completed' && (
            <Button variant="outline" size="sm" className="w-full">
              Book Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600">Manage your room reservations and schedule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filterBookings('confirmed').length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filterBookings('pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {filterBookings('completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.recurring).length}
            </div>
            <div className="text-sm text-gray-600">Recurring</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Bookings</TabsTrigger>
          <TabsTrigger value="completed">Past Bookings</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBookings('active').map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterBookings('completed').map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
