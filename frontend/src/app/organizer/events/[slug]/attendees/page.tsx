'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAttendeesBySlug, useExportAttendees, useAttendeeStats } from '@/hooks/useAttendees';
import { useEventBySlug } from '@/hooks/useEvents';
import { Attendee } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, Search, Users, UserCheck, UserX, ArrowLeft, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BulkTicketDialog } from '@/components/organizer/BulkTicketDialog';
import { WhatsAppTemplateDialog } from '@/components/organizer/WhatsAppTemplateDialog';
import { useTicketCategories } from '@/hooks/useTickets';


const AttendeesPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>(
    `Halo {name}, kami dari panitia event {event}. Kami ingin menginformasikan bahwa...`
  );

  const mapStatusForApi = (status: string | undefined): string | undefined => {
    if (!status || status === 'all') return undefined;
    switch (status) {
      case 'UNUSED':
        return 'unused';
      case 'REDEEMED':
        return 'redeemed';
      case 'CHECKED_IN':
        return 'checked_in';
      default:
        return status.toLowerCase();
    }
  };

  // Get event by slug first to get the event ID
  const { data: event, isLoading: eventLoading } = useEventBySlug(slug);
  const eventId = event?.id;

  const { data: attendeesData, isLoading, error } = useAttendeesBySlug(
    slug,
    mapStatusForApi(selectedStatus)
  );

  const exportMutation = useExportAttendees();

  // Get ticket categories for bulk ticket creation
  const { data: categoriesData } = useTicketCategories(eventId || '', !!eventId);
  const categories = categoriesData || [];

  // Load WhatsApp template from localStorage on mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem('whatsapp_template');
    if (savedTemplate) {
      setWhatsappTemplate(savedTemplate);
    }
  }, []);



  // Filter attendees based on search term
  const attendees = (attendeesData as any)?.data || attendeesData || [];
  const filteredAttendees = (Array.isArray(attendees) ? attendees : []).filter((attendee: Attendee) =>
    attendee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.ticket?.ticketCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (!slug) return;

    exportMutation.mutate({
      eventSlug: slug,
      status: mapStatusForApi(selectedStatus),
    }, {
      onSuccess: () => {
        toast.success('Data attendees berhasil diexport!');
      },
      onError: () => {
        toast.error('Gagal mengexport data attendees');
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      UNUSED: { label: 'Belum Redeem', variant: 'secondary' as const },
      REDEEMED: { label: 'Terkonfirmasi', variant: 'default' as const },
      CHECKED_IN: { label: 'Hadir', variant: 'default' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] ||
      { label: status, variant: 'secondary' as const };

    return (
      <Badge variant={config.variant} className="bg-green-100 text-green-800">
        {config.label}
      </Badge>
    );
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Remove non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Replace leading 0 with 62
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }

    return cleaned;
  };

  const handleWhatsAppFollowUp = (attendee: Attendee) => {
    if (!attendee.phoneNumber) {
      toast.error('Nomor telepon tidak tersedia');
      return;
    }

    const phone = formatPhoneNumber(attendee.phoneNumber);

    // Replace template variables with actual data
    const message = whatsappTemplate
      .replace(/{name}/g, attendee.fullName)
      .replace(/{event}/g, event?.title || '')
      .replace(/{ticketCode}/g, attendee.ticket?.ticketCode || '')
      .replace(/{category}/g, attendee.ticket?.category?.name || '');

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  if (eventLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!eventLoading && !event) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Event tidak ditemukan</h3>
              <p className="text-gray-600 mb-4">
                Event dengan slug &quot;{slug}&quot; tidak ditemukan atau tidak memiliki akses
              </p>
              <Button
                onClick={() => router.push('/organizer/attendees')}
                variant="outline"
              >
                Kembali ke Daftar Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-600 text-center">
              <h3 className="text-lg font-medium mb-2">Gagal memuat data peserta</h3>
              <p className="text-sm mb-4">{error.message}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Muat Ulang
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Data Kehadiran - {event?.title || 'Event'}
            </h1>
            <p className="text-gray-600">
              Kelola data kehadiran peserta seminar
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <WhatsAppTemplateDialog
            eventTitle={event?.title}
            currentTemplate={whatsappTemplate}
            onTemplateChange={setWhatsappTemplate}
          />
          {eventId && (
            <BulkTicketDialog
              eventId={eventId}
              eventSlug={slug}
              categories={categories}
            />
          )}
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending || attendees.length === 0}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>
              {exportMutation.isPending ? 'Mengexport...' : 'Export Excel'}
            </span>
          </Button>
        </div>
      </div>


      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari nama, email, atau kode tiket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="UNUSED">Belum Redeem</SelectItem>
            <SelectItem value="REDEEMED">Terkonfirmasi</SelectItem>
            <SelectItem value="CHECKED_IN">Sudah Hadir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Peserta ({filteredAttendees?.length} peserta)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttendees?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || selectedStatus !== 'all'
                ? 'Tidak ada peserta yang cocok dengan filter'
                : 'Belum ada data peserta'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">No</th>
                    <th className="text-left p-3 font-medium">Nama Lengkap</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Telepon</th>
                    <th className="text-left p-3 font-medium">Kode Tiket</th>
                    <th className="text-left p-3 font-medium">Kategori</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees?.map((attendee: Attendee, index: number) => (
                    <tr key={attendee.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium">{attendee.fullName}</td>
                      <td className="p-3">{attendee.email}</td>
                      <td className="p-3">{attendee.phoneNumber || '-'}</td>
                      <td className="p-3 font-mono text-xs">
                        {attendee.ticket?.ticketCode || '-'}
                      </td>
                      <td className="p-3">
                        {attendee.ticket?.category?.name || '-'}
                      </td>
                      <td className="p-3">
                        {attendee.ticket?.status && getStatusBadge(attendee.ticket.status)}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWhatsAppFollowUp(attendee)}
                          disabled={!attendee.phoneNumber}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Follow up via WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendeesPage;
