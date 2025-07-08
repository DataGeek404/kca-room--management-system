
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X } from "lucide-react";

interface SearchFilters {
  keyword: string;
  building: string;
  floor: string;
  minCapacity: number;
  maxCapacity: number;
  status: string;
  resources: string[];
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  timeTo: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export const AdvancedSearch = ({ onSearch, onClear }: AdvancedSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    building: "",
    floor: "",
    minCapacity: 0,
    maxCapacity: 0,
    status: "",
    resources: [],
    dateFrom: "",
    dateTo: "",
    timeFrom: "",
    timeTo: ""
  });

  const resources = [
    "projector", "whiteboard", "computers", "microphone", 
    "air_conditioning", "video_conferencing", "smart_board", "sound_system"
  ];

  const buildings = ["Main Building", "IT Building", "Admin Block", "Academic Block", "Library"];

  const handleResourceToggle = (resource: string) => {
    const newResources = filters.resources.includes(resource)
      ? filters.resources.filter(r => r !== resource)
      : [...filters.resources, resource];
    
    setFilters({ ...filters, resources: newResources });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      keyword: "",
      building: "",
      floor: "",
      minCapacity: 0,
      maxCapacity: 0,
      status: "",
      resources: [],
      dateFrom: "",
      dateTo: "",
      timeFrom: "",
      timeTo: ""
    });
    onClear();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {isExpanded ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search rooms by name or description..."
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            className="flex-1"
          />
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
            Search
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Building</Label>
                <Select value={filters.building} onValueChange={(value) => setFilters({ ...filters, building: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any building" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any building</SelectItem>
                    {buildings.map(building => (
                      <SelectItem key={building} value={building}>{building}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Floor</Label>
                <Input
                  type="number"
                  placeholder="Any floor"
                  value={filters.floor}
                  onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Capacity</Label>
                <Input
                  type="number"
                  min="0"
                  value={filters.minCapacity || ""}
                  onChange={(e) => setFilters({ ...filters, minCapacity: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Capacity</Label>
                <Input
                  type="number"
                  min="0"
                  value={filters.maxCapacity || ""}
                  onChange={(e) => setFilters({ ...filters, maxCapacity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Required Resources</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {resources.map((resource) => (
                  <div key={resource} className="flex items-center space-x-2">
                    <Checkbox
                      id={resource}
                      checked={filters.resources.includes(resource)}
                      onCheckedChange={() => handleResourceToggle(resource)}
                    />
                    <Label htmlFor={resource} className="text-sm capitalize">
                      {resource.replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Available From Date</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Available To Date</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Available From Time</Label>
                <Input
                  type="time"
                  value={filters.timeFrom}
                  onChange={(e) => setFilters({ ...filters, timeFrom: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Available To Time</Label>
                <Input
                  type="time"
                  value={filters.timeTo}
                  onChange={(e) => setFilters({ ...filters, timeTo: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
