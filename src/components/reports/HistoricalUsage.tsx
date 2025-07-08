
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Calendar, Clock, Users } from "lucide-react";

export const HistoricalUsage = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedRoom, setSelectedRoom] = useState("all");
  const [usageData, setUsageData] = useState([]);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    totalHours: 0,
    averageOccupancy: 0,
    peakHours: ""
  });

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockData = [
      { date: "2024-01-01", bookings: 15, hours: 45, occupancyRate: 65 },
      { date: "2024-01-02", bookings: 18, hours: 52, occupancyRate: 72 },
      { date: "2024-01-03", bookings: 12, hours: 38, occupancyRate: 58 },
      { date: "2024-01-04", bookings: 22, hours: 68, occupancyRate: 85 },
      { date: "2024-01-05", bookings: 16, hours: 48, occupancyRate: 68 },
      { date: "2024-01-06", bookings: 8, hours: 24, occupancyRate: 35 },
      { date: "2024-01-07", bookings: 6, hours: 18, occupancyRate: 28 }
    ];

    setUsageData(mockData);
    setSummary({
      totalBookings: mockData.reduce((sum, day) => sum + day.bookings, 0),
      totalHours: mockData.reduce((sum, day) => sum + day.hours, 0),
      averageOccupancy: Math.round(mockData.reduce((sum, day) => sum + day.occupancyRate, 0) / mockData.length),
      peakHours: "10:00 AM - 2:00 PM"
    });
  }, [timeRange, selectedRoom]);

  const rooms = [
    { id: "all", name: "All Rooms" },
    { id: "1", name: "Lecture Hall A" },
    { id: "2", name: "Computer Lab 1" },
    { id: "3", name: "Conference Room" },
    { id: "4", name: "Tutorial Room 1" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rooms.map(room => (
              <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{summary.totalBookings}</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{summary.totalHours}</p>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{summary.averageOccupancy}%</p>
                <p className="text-sm text-gray-600">Avg Occupancy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xl font-bold">{summary.peakHours}</p>
                <p className="text-sm text-gray-600">Peak Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="occupancyRate" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Usage History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Hours Used</TableHead>
                <TableHead>Occupancy Rate</TableHead>
                <TableHead>Most Used Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageData.map((day, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                  <TableCell>{day.bookings}</TableCell>
                  <TableCell>{day.hours} hrs</TableCell>
                  <TableCell>{day.occupancyRate}%</TableCell>
                  <TableCell>10:00 AM - 12:00 PM</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
