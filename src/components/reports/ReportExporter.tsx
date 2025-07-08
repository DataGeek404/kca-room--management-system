
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileText, Table, FileSpreadsheet, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface ReportExporterProps {
  reportType: string;
  data: any[];
  onExport: (format: string, filters: any) => void;
}

export const ReportExporter = ({ reportType, data, onExport }: ReportExporterProps) => {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [filters, setFilters] = useState({
    building: "",
    floor: "",
    department: ""
  });

  const handleExport = () => {
    onExport(exportFormat, {
      dateRange,
      filters,
      reportType
    });
  };

  const formatOptions = [
    { value: "pdf", label: "PDF Document", icon: FileText },
    { value: "excel", label: "Excel Spreadsheet", icon: FileSpreadsheet },
    { value: "csv", label: "CSV File", icon: Table }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`
                    : "Select date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Building</label>
            <Select 
              value={filters.building} 
              onValueChange={(value) => setFilters({...filters, building: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All buildings</SelectItem>
                <SelectItem value="Main Building">Main Building</SelectItem>
                <SelectItem value="IT Building">IT Building</SelectItem>
                <SelectItem value="Admin Block">Admin Block</SelectItem>
                <SelectItem value="Academic Block">Academic Block</SelectItem>
                <SelectItem value="Library">Library</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Floor</label>
            <Select 
              value={filters.floor} 
              onValueChange={(value) => setFilters({...filters, floor: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All floors</SelectItem>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
                <SelectItem value="4">Floor 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Select 
              value={filters.department} 
              onValueChange={(value) => setFilters({...filters, department: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All departments</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {data.length} records available for export
          </div>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export {formatOptions.find(f => f.value === exportFormat)?.label}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
