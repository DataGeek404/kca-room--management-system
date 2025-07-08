
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Edit, Trash2, Eye, Copy, Calendar } from "lucide-react";
import { Booking } from "@/services/bookingService";

interface BookingContextMenuProps {
  children: React.ReactNode;
  booking: Booking;
  isAdmin: boolean;
  canEdit: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const BookingContextMenu: React.FC<BookingContextMenuProps> = ({
  children,
  booking,
  isAdmin,
  canEdit,
  onView,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onView} className="cursor-pointer">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </ContextMenuItem>
        
        {canEdit && (
          <>
            <ContextMenuItem onClick={onEdit} className="cursor-pointer">
              <Edit className="w-4 h-4 mr-2" />
              Edit Booking
            </ContextMenuItem>
            <ContextMenuItem onClick={onDuplicate} className="cursor-pointer">
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Booking
            </ContextMenuItem>
          </>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          onClick={onDelete} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Booking
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
