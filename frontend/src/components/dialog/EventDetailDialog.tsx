import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Eye,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Event, EventOrganizer } from "@/types";
import { RichTextDisplay } from "../ui/rich-text-display";
import { ScrollArea } from "../ui/scroll-area";

interface EventDetailDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({ event, open, onOpenChange }: EventDetailDialogProps) {
  console.log('EventDetailDialog render:', { event, open });

  if (!event) return null;

  const getStatusVariant = ( status?: string) => {
;
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

  const getStatusLabel = ( status?: string) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! max-h-[90vh] overflow-auto">
        <ScrollArea>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={event.imageUrl} alt={event.title} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {event.title.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl">{event.title}</div>
              <Badge variant={getStatusVariant(event.status)} className="mt-1">
                {getStatusLabel(event.status)}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Detail lengkap event {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Tanggal Mulai:</span>
                  <span>{format(new Date(event.startDate), "dd MMMM yyyy, HH:mm", { locale: idLocale })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Tanggal Berakhir:</span>
                  <span>{format(new Date(event.endDate), "dd MMMM yyyy, HH:mm", { locale: idLocale })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Lokasi:</span>
                  <span>{event.location}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Harga Dasar:</span>
                  <span>{event.basePrice ? `Rp ${event.basePrice.toLocaleString('id-ID')}` : 'Gratis'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Slug:</span>
                  <span className="font-mono text-xs">{event.slug}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className={`h-4 w-4 ${event.isActive ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="font-medium">Status :</span>
                  <span>{event.status}</span>
                </div>
              </div>
            </div>

            {event.description && (
              <div className="space-y-2">
                <span className="font-medium text-sm">Deskripsi:</span>
                <div className="text-sm text-gray-600 bg-gray-50 py-8 px-3 rounded-md">
                  <RichTextDisplay content={event.description} />
                </div>
              </div>
            )}

            {event.termsAndConditions && (
              <div className="space-y-2">
                <span className="font-medium text-sm">Syarat & Ketentuan:</span>
                <div className="text-sm text-gray-600 bg-gray-50 py-8 px-3 rounded-md">
                  <RichTextDisplay content={event.termsAndConditions} />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Organizer Information */}
          {event.organizer && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Organizer</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={event.organizer.profileImage} alt={event.organizer.firstName} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {event.organizer.firstName?.charAt(0)}{event.organizer.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="font-medium">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-3 w-3" />
                    {event.organizer.email}
                  </div>
                  {event.organizer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      {event.organizer.phone}
                    </div>
                  )}
                  {event.organizer.description && (
                    <div className="text-sm text-gray-600 mt-2">
                      {event.organizer.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informasi Sistem</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Dibuat pada:</span>
                <div className="text-gray-600">
                  {format(new Date(event.createdAt), "dd MMMM yyyy, HH:mm:ss", { locale: idLocale })}
                </div>
              </div>
              <div>
                <span className="font-medium">Diupdate pada:</span>
                <div className="text-gray-600">
                  {format(new Date(event.updatedAt), "dd MMMM yyyy, HH:mm:ss", { locale: idLocale })}
                </div>
              </div>
            </div>
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
