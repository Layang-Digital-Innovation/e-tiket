import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { EventOrganizer, User as UserType } from "@/types";

interface UserDetailDialogProps {
  user: (EventOrganizer | UserType) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDialog({ user, open, onOpenChange }: UserDetailDialogProps) {
  console.log('UserDetailDialog render:', { user, open });

  if (!user) return null;

  // Type guard to check if it's EventOrganizer or User
  const isEventOrganizer = (user: EventOrganizer | UserType): user is EventOrganizer => {
    return 'description' in user;
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'event_organizer':
        return 'Event Organizer';
      case 'user':
        return 'User';
      default:
        return 'Unknown';
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'event_organizer':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Tidak Aktif';
      case 'suspended':
        return 'Ditangguhkan';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={(user as UserType).profileImage} alt={user.email} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {isEventOrganizer(user)
                  ? `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`
                  : user.firstName?.charAt(0) + user.lastName?.charAt(0)
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl">
                {isEventOrganizer(user)
                  ? `${user.firstName} ${user.lastName}`
                  : `${user.firstName} ${user.lastName}`
                }
              </div>
              <div className="flex gap-2 mt-1">
                <Badge className={getRoleColor((user as UserType).role)}>
                  {getRoleLabel((user as UserType).role)}
                </Badge>
                {(user as UserType).status && (
                  <Badge className={getStatusColor((user as UserType).status)}>
                    {getStatusLabel((user as UserType).status)}
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detail lengkap {isEventOrganizer(user) ? 'event organizer' : 'user'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Nama Lengkap:</span>
                  <span>
                    {isEventOrganizer(user)
                      ? `${user.firstName} ${user.lastName}`
                      : `${user.firstName} ${user.lastName}`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Telepon:</span>
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              {!isEventOrganizer(user) && (user as UserType).role && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Role:</span>
                    <span>{getRoleLabel((user as UserType).role)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`h-4 w-4 ${(user as UserType).emailVerified ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="font-medium">Email Terverifikasi:</span>
                    <span>{(user as UserType).emailVerified ? 'Ya' : 'Tidak'}</span>
                  </div>
                  {(user as UserType).status && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${(user as UserType).status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="font-medium">Status:</span>
                      <span>{getStatusLabel((user as UserType).status)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEventOrganizer(user) && user.description && (
              <div className="space-y-2">
                <span className="font-medium text-sm">Deskripsi:</span>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {user.description}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Sistem</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Dibuat pada:</span>
                <div className="text-gray-600">
                  {format(new Date(user.createdAt), "dd MMMM yyyy, HH:mm:ss", { locale: idLocale })}
                </div>
              </div>
              <div>
                <span className="font-medium">Diupdate pada:</span>
                <div className="text-gray-600">
                  {format(new Date(user.updatedAt), "dd MMMM yyyy, HH:mm:ss", { locale: idLocale })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
