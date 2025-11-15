'use client';

import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEventBySlug } from '@/hooks/useEvents';
import { useTicketCategories } from '@/hooks/useTickets';
import { RichTextDisplay } from '@/components/ui/rich-text-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Ticket, DollarSign, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function EOEventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: event, isLoading, error } = useEventBySlug(slug);
  const { data: tickets = [], isLoading: ticketsLoading } = useTicketCategories(event?.id || '', !!event?.id);

  // Calculate statistics
  const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.maxQuantity, 0);
  const totalSold = tickets.reduce((sum, ticket) => sum + ticket.sold, 0);
  const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.sold), 0);
  const salesProgress = totalTickets > 0 ? (totalSold / totalTickets) * 100 : 0;

  // Prepare chart data
  const barChartData = tickets.map(ticket => ({
    name: ticket.name,
    terjual: ticket.sold,
    tersisa: ticket.maxQuantity - ticket.sold,
    total: ticket.maxQuantity,
    revenue: ticket.price * ticket.sold,
  }));

  const pieChartData = tickets.map(ticket => ({
    name: ticket.name,
    value: ticket.sold,
    revenue: ticket.price * ticket.sold,
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const chartConfig = {
    terjual: {
      label: 'Terjual',
      color: 'var(--chart-1)',
    },
    tersisa: {
      label: 'Tersisa',
      color: 'var(--chart-2)',
    },
  };

  const exportAttendanceCsv = async () => {
    if (!event?.id) return;
    try {
      const res = await (await import('@/services/api')).apiService.getCheckInListByEvent(event.id);
      const list = (res as any).data as any[];

      const rows = list.map((wb: any, idx: number) => {
        const ticket = wb.assignedTicket || {};
        const attendee = ticket.attendee || (ticket.orderItem?.attendees?.[0] ?? {});
        return {
          No: (idx + 1).toString(),
          Nama: attendee.fullName || '',
          Email: attendee.email || '',
          Telepon: attendee.phoneNumber || '',
          TicketCode: ticket.ticketCode || '',
          Status: wb.status || ticket.status || '',
          'Waktu Check-in': (wb.checkedInAt || ticket.checkedInAt) ? new Date(wb.checkedInAt || ticket.checkedInAt).toLocaleString('id-ID') : '',
        };
      });

      const headers = ['No','Nama','Email','Telepon','TicketCode','Status','Waktu Check-in'];
      const csv = [
        '\uFEFF' + headers.join(','),
        ...rows.map(r => headers.map(h => {
          const val = (r as any)[h] ?? '';
          const s = String(val).replace(/"/g, '""');
          return `"${s}` + `"`;
        }).join(',')),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daftar-hadir-${event.slug}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error('Export attendance failed', e);
      alert(e?.message || 'Gagal mengekspor daftar hadir');
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail event...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Event</h2>
          <p className="text-gray-600 mb-4">{error.message || 'Terjadi kesalahan saat memuat data'}</p>
          <Link
            href="/organizer/events"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Kembali ke Daftar Event
          </Link>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-5xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Event yang Anda cari tidak ditemukan</p>
          <Link
            href="/organizer/events"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Kembali ke Daftar Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/organizer/events">My Events</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{event.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>
              <div className="flex items-center space-x-4">
                {event.status && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {event.status === 'published' ? 'Aktif' : event.status === 'draft' ? 'Draft' : 'Dibatalkan'}
                  </span>
                )}
                {event.createdAt && (
                  <span className="text-sm text-gray-500">
                    Dibuat: {new Date(event.createdAt).toLocaleDateString('id-ID')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/organizer/events/${event.slug}/edit`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Edit Event
              </Link>
              <Link
                href={`/organizer/events/${event.slug}/tickets`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Kelola Tiket
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      *Belum dipotong biaya
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tiket Terjual</CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalSold}</div>
                    <p className="text-xs text-muted-foreground">
                      dari {totalTickets} tiket
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progress</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{salesProgress.toFixed(1)}%</div>
                    <Progress value={salesProgress} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tiket Tersisa</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{totalTickets - totalSold}</div>
                    <p className="text-xs text-muted-foreground">
                      {((totalTickets - totalSold) / totalTickets * 100).toFixed(1)}% tersisa
                    </p>
                  </CardContent>
                </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-8">
            {/* Bar Chart - Ticket Sales */}
            {tickets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Penjualan Tiket per Kategori</CardTitle>
                  <CardDescription>Perbandingan tiket terjual dan tersisa</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="name" 
                        tickLine={true}
                        axisLine={true}
                        className="text-xs"
                      />
                      <YAxis 
                        tickLine={true}
                        axisLine={true}
                        className="text-xs"
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="terjual" fill="var(--color-terjual)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tersisa" fill="var(--color-tersisa)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Pie Chart - Revenue Distribution */}
            {tickets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Pendapatan</CardTitle>
                  <CardDescription>Kontribusi revenue per kategori tiket</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        {payload[0].name}
                                      </span>
                                      <span className="font-bold text-muted-foreground">
                                        Rp {payload[0].value?.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Event Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Detail Event</CardTitle>
                  <CardDescription>Informasi lengkap tentang event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi
                    </label>
                    <RichTextDisplay content={event.description} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tanggal & Waktu Mulai
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(event.startDate).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tanggal & Waktu Selesai
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(event.endDate).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lokasi
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{event.location}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Ticket Details & Quick Actions */}
            <div className="space-y-6">
              {/* Ticket Details Table */}
              {tickets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detail Tiket</CardTitle>
                    <CardDescription>Informasi lengkap setiap kategori</CardDescription>
                  </CardHeader>
                  <div className="px-6 pb-2">
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-xs text-yellow-800">
                        <span className="font-semibold">ℹ️</span> Pendapatan kotor belum dipotong biaya payment gateway, biaya platform, dan pajak.
                      </p>
                    </div>
                  </div>
                  <CardContent>
                    <div className="space-y-4">
                      {tickets.map((ticket, index) => {
                        const ticketProgress = ticket.maxQuantity > 0 ? (ticket.sold / ticket.maxQuantity) * 100 : 0;
                        const ticketRevenue = ticket.price * ticket.sold;
                        
                        return (
                          <div key={ticket.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="font-medium">{ticket.name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {ticket.sold}/{ticket.maxQuantity}
                              </span>
                            </div>
                            <Progress value={ticketProgress} className="h-2" />
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                               @ {formatCurrency(ticket.price)}
                              </span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(ticketRevenue)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {event.eventType === 'SEMINAR' && (
                    <Button onClick={exportAttendanceCsv} className="w-full text-left justify-start px-3 py-2 text-sm">
                      Export Daftar Hadir (CSV)
                    </Button>
                  )}
                  <Link
                    href={`/organizer/events/${event.slug}/redeem-items`}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors flex items-center gap-2"
                  >
                    <span>Kelola Redeem Items</span>
                  </Link>
                  <Link
                    href={`/redeem/${event.id}`}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors flex items-center gap-2"
                  >
                    <span>Redeem Tiket</span>
                  </Link>
                  <Link
                    href={`/event/${event.slug}`}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors flex items-center gap-2"
                  >
                    <span>Lihat Halaman Publik</span>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
