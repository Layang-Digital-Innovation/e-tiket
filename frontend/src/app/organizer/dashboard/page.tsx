'use client';

import Link from 'next/link';
import { useDashboardStats, useRecentEvents, useSalesChart } from '@/hooks/useDashboard';
import { Loader2, Calendar, Ticket as TicketIcon, DollarSign, TrendingUp, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function EODashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentEvents = [], isLoading: eventsLoading } = useRecentEvents(5);
  const { data: salesData = [], isLoading: salesLoading } = useSalesChart(7);

  const isLoading = statsLoading || eventsLoading || salesLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeProps = (status?: string) => {
    switch (status) {
      case 'published':
        return { variant: 'success' as const, text: 'Diterbitkan' };
      case 'draft':
        return { variant: 'warning' as const, text: 'Draf' };
      case 'cancelled':
      case 'completed':
        return { variant: 'danger' as const, text: 'Dibatalkan' };
      default:
        return { variant: 'secondary' as const, text: 'Tidak Diketahui' };
    }
  };

  const chartConfig = {
    sales: {
      label: 'Penjualan',
      color: 'hsl(var(--chart-1))',
    },
  };

  // Check if sales data has any non-zero values
  const hasSalesData = salesData.some(item => item.sales > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Total Events */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Calendar className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Events
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats?.totalEvents || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tickets Sold */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TicketIcon className="w-8 h-8 text-green-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Tiket Terjual
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats?.totalTicketsSold || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Pendapatan
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : 'Rp 0'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Events */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="w-8 h-8 text-purple-500" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Event Aktif
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats?.activeEvents || 0}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Events */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Event Terbaru
                    </h3>
                    {recentEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada event</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentEvents.map((event) => (
                          <Link
                            key={event.id}
                            href={`/organizer/events/${event.slug}`}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                          >
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {event.title}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {format(new Date(event.startDate), 'dd MMM yyyy')}
                              </p>
                              <p className="text-sm text-gray-500">
                                {event.ticketCategories?.reduce((total, category) => total + category.sold, 0) || 0} tiket terjual
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant={getStatusBadgeProps(event.status).variant}>
                                {getStatusBadgeProps(event.status).text}
                              </Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="mt-4">
                      <Link
                        href="/organizer/events"
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Lihat semua events →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Sales Chart */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Penjualan Tiket (7 Hari Terakhir)
                    </h3>
                    {!hasSalesData ? (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada penjualan tiket</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Data penjualan akan muncul setelah ada transaksi yang berhasil
                        </p>
                      </div>
                    ) : (
                      <ChartContainer config={chartConfig} className="h-64">
                        <LineChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                            fontSize={12}
                          />
                          <YAxis fontSize={12} />
                          <ChartTooltip
                            content={<ChartTooltipContent />}
                            labelFormatter={(value) => format(new Date(value), 'dd MMMM yyyy')}
                            formatter={(value) => [value, 'Penjualan']}
                          />
                          <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="var(--color-sales)"
                            strokeWidth={2}
                            dot={{ fill: 'var(--color-sales)', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Aksi Cepat
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      href="/organizer/events/create"
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Buat Event Baru
                    </Link>
                    <Link
                      href="/organizer/events"
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <TicketIcon className="w-5 h-5 mr-2" />
                      Kelola Tiket
                    </Link>
                    <Link
                      href="/redeem"
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Redeem & Check-in
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
