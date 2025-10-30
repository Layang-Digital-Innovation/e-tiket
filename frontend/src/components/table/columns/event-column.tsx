import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Calendar, MapPin, Users, DollarSign, User } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Event, EventOrganizer } from "@/types";
import { formatCurrency, stripHtml } from "@/lib/utils";

interface EventColumnsProps {
  onViewEventDetail?: (event: Event) => void;
  onViewUserDetail?: (user: EventOrganizer) => void;
}

export const eventColumns = ({ onViewEventDetail, onViewUserDetail }: EventColumnsProps = {}): ColumnDef<Event>[] => {
  return [
  {
    accessorKey: "title",
    header: "Event",
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarImage src={event.imageUrl} alt={event.title} />
            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
              {event.title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{event.title}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "organizer",
    header: "Organizer",
    cell: ({ row }) => {
      const organizer = row.original.organizer
      return organizer ? (
        <Button
          variant="ghost"
          className="h-auto p-0 text-left justify-start"
          onClick={() => {
            console.log('Organizer clicked:', organizer);
            onViewUserDetail?.(organizer);
          }}
        >
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 text-gray-500" />
            <span className="text-sm">
              {organizer.firstName + " " + organizer.lastName}
            </span>
          </div>
        </Button>
      ) : (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <User className="h-3 w-3" />
          <span>ID: {row.original.organizerId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Tanggal",
    cell: ({ row }) => {
      const startDate = new Date(row.getValue("startDate"));
      const endDate = new Date(row.original.endDate);

      return (
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>
              {format(startDate, "dd MMM yyyy", { locale: idLocale })}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Lokasi",
    cell: ({ row }) => (
      <div className="text-sm flex items-center space-x-1">
        <MapPin className="h-3 w-3 text-gray-400" />
        <span>{row.getValue("location")}</span>
      </div>
    ),
  },
  {
    accessorKey: "basePrice",
    header: "Harga",
    cell: ({ row }) => {
      const price = row.getValue("basePrice") as number;
      return (
        <div className="text-sm flex items-center space-x-1">
          <span>
            {price ? formatCurrency(price) : 'Gratis'}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      const status = row.original.status;

      const getStatusVariant = (status?: string) => {
       
        switch (status) {
          case "published":
            return "default";
          case "draft":
            return "outline";
          case "cancelled":
            return "destructive";
          default:
            return "default";
        }
      };

      const getStatusLabel = (status?: string) => {
        switch (status) {
          case "published":
            return "Published";
          case "draft":
            return "Draft";
          case "cancelled":
            return "Dibatalkan";
          default:
            return "Published";
        }
      };

      return (
        <Badge variant={getStatusVariant(status)} className="text-xs">
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Dibuat",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm text-gray-600">
          {format(date, "dd MMM yyyy", { locale: idLocale })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const event = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              console.log('View event detail clicked:', event);
              onViewEventDetail?.(event);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              Lihat Detail Event
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
};
