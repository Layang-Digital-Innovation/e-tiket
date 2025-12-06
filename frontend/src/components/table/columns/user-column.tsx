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
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { User } from "@/types";

interface UserColumnsProps {
  onViewUserDetail?: (user: User) => void;
}

export const userColumns = ({ onViewUserDetail }: UserColumnsProps = {}): ColumnDef<User>[] => {
  return [
  {
    accessorKey: "firstName",
    header: "Nama",
    cell: ({ row }) => {
      const user = row.original;
      const fullName = `${user.firstName} ${user.lastName || ""}`.trim();

      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImage} alt={fullName} />
            <AvatarFallback className="text-xs">
              {user.firstName.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase() || ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{fullName}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm">
        <div>{row.getValue("email")}</div>
        
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const getRoleVariant = (role: string) => {
        switch (role) {
          case "ADMIN":
            return "destructive";
          case "EVENT_ORGANIZER":
            return "default";
          case "USER":
            return "secondary";
          default:
            return "outline";
        }
      };

      const getRoleLabel = (role: string) => {
        switch (role) {
          case "ADMIN":
            return "Admin";
          case "EVENT_ORGANIZER":
            return "Event Organizer";
          case "USER":
            return "User";
          default:
            return role;
        }
      };

      return (
        <Badge variant={getRoleVariant(role)} className="text-xs">
          {getRoleLabel(role)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusVariant = (status: string) => {
        switch (status) {
          case "ACTIVE":
            return "default";
          case "INACTIVE":
            return "secondary";
          case "SUSPENDED":
            return "destructive";
          default:
            return "outline";
        }
      };

      const getStatusLabel = (status: string) => {
        switch (status) {
          case "ACTIVE":
            return "Aktif";
          case "INACTIVE":
            return "Tidak Aktif";
          case "SUSPENDED":
            return "Dibekukan";
          default:
            return status;
        }
      };

      return (
        <Badge variant={getStatusVariant(status || "active")} className="text-xs">
          {getStatusLabel(status || "active")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Bergabung",
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
      const user = row.original;

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
              console.log('View user detail clicked:', user);
              onViewUserDetail?.(user);
            }}>
              <Eye className="mr-2 h-4 w-4" />
              Lihat Detail
            </DropdownMenuItem>
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