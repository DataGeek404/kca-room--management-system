
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface RecurringBookingFormProps {
  isRecurring: boolean;
  onRecurringChange: (recurring: boolean) => void;
  recurringData: {
    frequency: string;
    endDate: string;
    daysOfWeek: string[];
    endAfter: number;
  };
  onRecurringDataChange: (data: any) => void;
}

export const RecurringBookingForm = ({
  isRecurring,
  onRecurringChange,
  recurringData,
  onRecurringDataChange
}: RecurringBookingFormProps) => {
  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  const handleDayToggle = (dayId: string) => {
    const newDays = recurringData.daysOfWeek.includes(dayId)
      ? recurringData.daysOfWeek.filter(d => d !== dayId)
      : [...recurringData.daysOfWeek, dayId];
    
    onRecurringDataChange({
      ...recurringData,
      daysOfWeek: newDays
    });
  };

  if (!isRecurring) {
    return (
      <div className="flex items-center space-x-2">
        <Checkbox
          id="recurring"
          checked={isRecurring}
          onCheckedChange={(checked) => onRecurringChange(!!checked)}
        />
        <Label htmlFor="recurring">Make this a recurring booking</Label>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recurring Booking Settings</CardTitle>
          <Checkbox
            checked={isRecurring}
            onCheckedChange={(checked) => onRecurringChange(!!checked)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select 
              value={recurringData.frequency} 
              onValueChange={(value) => onRecurringDataChange({...recurringData, frequency: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={recurringData.endDate}
              onChange={(e) => onRecurringDataChange({...recurringData, endDate: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {recurringData.frequency === 'weekly' && (
          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {daysOfWeek.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={recurringData.daysOfWeek.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <Label htmlFor={day.id} className="text-sm">{day.label}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Or end after number of occurrences</Label>
          <Input
            type="number"
            min="1"
            max="52"
            value={recurringData.endAfter}
            onChange={(e) => onRecurringDataChange({...recurringData, endAfter: parseInt(e.target.value) || 1})}
          />
        </div>
      </CardContent>
    </Card>
  );
};
