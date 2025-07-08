
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ReportsView = () => {
  const reportTypes = [
    {
      id: "utilization",
      title: "Room Utilization Report",
      description: "Detailed analysis of room usage patterns and efficiency metrics"
    },
    {
      id: "bookings",
      title: "Booking History Report", 
      description: "Complete booking records with user details and time patterns"
    },
    {
      id: "maintenance",
      title: "Maintenance Report",
      description: "Maintenance costs, frequency, and room condition analysis"
    },
    {
      id: "user-activity",
      title: "User Activity Report",
      description: "User engagement statistics and booking behavior patterns"
    }
  ];

  const quickStats = [
    { label: "Total Bookings This Month", value: "156", change: "+12%" },
    { label: "Average Room Utilization", value: "78%", change: "+5%" },
    { label: "Maintenance Requests", value: "24", change: "-8%" },
    { label: "Active Users", value: "89", change: "+15%" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Generate insights and export data for analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className="text-xs text-green-600 mt-1">{stat.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Report Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                <SelectItem value="a">Building A</SelectItem>
                <SelectItem value="b">Building B</SelectItem>
                <SelectItem value="c">Building C</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Report format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            Generate Quick Report
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <p className="text-sm text-gray-600">{report.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Preview
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Monthly Utilization Report - June 2024", date: "July 8, 2024", format: "PDF" },
              { name: "Maintenance Cost Analysis - Q2 2024", date: "July 5, 2024", format: "Excel" },
              { name: "User Activity Summary - Week 27", date: "July 3, 2024", format: "CSV" }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600">Generated on {report.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {report.format}
                  </span>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
