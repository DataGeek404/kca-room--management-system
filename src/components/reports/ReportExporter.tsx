
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, FileText, Table, FileSpreadsheet, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ReportExporterProps {
  reportType: string;
  data: any[];
  onExport: (format: string, filters: any) => void;
}

interface Department {
  id: string;
  name: string;
}

export const ReportExporter = ({ reportType, data, onExport }: ReportExporterProps) => {
  const [exportFormat, setExportFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [filters, setFilters] = useState({
    building: "all",
    floor: "all",
    department: "all"
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const { toast } = useToast();

  // Load departments dynamically
  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, using mock data that would come from the Department Management
    const mockDepartments = [
      { id: "1", name: "Computer Science" },
      { id: "2", name: "Business" },
      { id: "3", name: "Engineering" },
      { id: "4", name: "Arts" }
    ];
    setDepartments(mockDepartments);
  }, []);

  const handleExport = () => {
    try {
      onExport(exportFormat, {
        dateRange,
        filters,
        reportType
      });
      
      const formatLabel = formatOptions.find(f => f.value === exportFormat)?.label || exportFormat;
      toast({
        title: "Success!",
        description: `${formatLabel} export started successfully`,
      });
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatOptions = [
    { value: "pdf", label: "PDF Document", icon: FileText },
    { value: "excel", label: "Excel Spreadsheet", icon: FileSpreadsheet },
    { value: "csv", label: "CSV File", icon: Table }
  ];

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-foreground">
          <Download className="h-5 w-5 text-primary" />
          Export Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="border-input">
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
            <label className="text-sm font-medium text-foreground">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal w-full border-input">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Building</label>
            <Select 
              value={filters.building} 
              onValueChange={(value) => setFilters({...filters, building: value})}
            >
              <SelectTrigger className="border-input">
                <SelectValue placeholder="All buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All buildings</SelectItem>
                <SelectItem value="Main Building">Main Building</SelectItem>
                <SelectItem value="IT Building">IT Building</SelectItem>
                <SelectItem value="Admin Block">Admin Block</SelectItem>
                <SelectItem value="Academic Block">Academic Block</SelectItem>
                <SelectItem value="Library">Library</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Floor</label>
            <Select 
              value={filters.floor} 
              onValueChange={(value) => setFilters({...filters, floor: value})}
            >
              <SelectTrigger className="border-input">
                <SelectValue placeholder="All floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All floors</SelectItem>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
                <SelectItem value="4">Floor 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Department</label>
            <Select 
              value={filters.department} 
              onValueChange={(value) => setFilters({...filters, department: value})}
            >
              <SelectTrigger className="border-input">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {data.length} records available for export
          </div>
          <Button 
            onClick={handleExport} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export {formatOptions.find(f => f.value === exportFormat)?.label}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
