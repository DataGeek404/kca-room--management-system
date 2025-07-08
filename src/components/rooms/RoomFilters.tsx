
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RoomFiltersProps {
  searchTerm: string;
  buildingFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onBuildingChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export const RoomFilters = ({
  searchTerm,
  buildingFilter,
  statusFilter,
  onSearchChange,
  onBuildingChange,
  onStatusChange
}: RoomFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Input
        placeholder="Search rooms by name or building..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-md"
      />
      
      <Select value={buildingFilter} onValueChange={onBuildingChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Buildings" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Buildings</SelectItem>
          <SelectItem value="Main Building">Main Building</SelectItem>
          <SelectItem value="IT Building">IT Building</SelectItem>
          <SelectItem value="Admin Block">Admin Block</SelectItem>
          <SelectItem value="Academic Block">Academic Block</SelectItem>
          <SelectItem value="Library">Library</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="occupied">Occupied</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
