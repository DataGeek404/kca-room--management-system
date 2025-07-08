
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Room } from "@/services/roomService";
import { Booking } from "@/services/bookingService";
import moment from 'moment';

interface LecturerBookingFormProps {
  rooms: Room[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialSlot?: { start: Date; end: Date } | null;
  initialBooking?: Booking | null;
}

export const LecturerBookingForm: React.FC<LecturerBookingFormProps> = ({
  rooms,
  onSubmit,
  onCancel,
  initialSlot,
  initialBooking
}) => {
  const [formData, setFormData] = useState({
    roomId: initialBooking?.room_id || '',
    title: initialBooking?.title || '',
    startTime: initialBooking?.start_time 
      ? moment(initialBooking.start_time).format('YYYY-MM-DDTHH:mm')
      : initialSlot?.start 
        ? moment(initialSlot.start).format('YYYY-MM-DDTHH:mm')
        : '',
    endTime: initialBooking?.end_time
      ? moment(initialBooking.end_time).format('YYYY-MM-DDTHH:mm')
      : initialSlot?.end 
        ? moment(initialSlot.end).format('YYYY-MM-DDTHH:mm')
        : '',
    description: initialBooking?.description || '',
    recurring: initialBooking?.recurring || false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomId || !formData.title || !formData.startTime || !formData.endTime) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="room">Room *</Label>
        <Select 
          value={formData.roomId.toString()} 
          onValueChange={(value) => handleInputChange('roomId', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.filter(room => room.status === 'available').map((room) => (
              <SelectItem key={room.id} value={room.id.toString()}>
                {room.name} - {room.building} Floor {room.floor} (Capacity: {room.capacity})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Class/Event Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="e.g., Computer Science 101 Lecture"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Input
            id="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Additional notes about your class or event"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="recurring"
          checked={formData.recurring}
          onCheckedChange={(checked) => handleInputChange('recurring', checked)}
        />
        <Label htmlFor="recurring">This is a recurring booking (requires approval)</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialBooking ? 'Update Booking' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};
