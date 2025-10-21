'use client';

import Link from 'next/link';
import { useAdminDashboard } from '@/hooks/useAdmin';
import { Loader2, Users, Building2, Calendar, Ticket, DollarSign, TrendingUp, UserPlus, FileText, Settings, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const { stats, recentActivities, isLoading } = useAdminDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'event_created':
        return <Calendar className="w-4 h-4 text-green-600" />;
      case 'tickets_sold':
        return <Ticket className="w-4 h-4 text-purple-600" />;
      case 'payment_received':
        return <DollarSign className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-100 border-blue-200';
      case 'event_created':
        return 'bg-green-100 border-green-200';
      case 'tickets_sold':
        return 'bg-purple-100 border-purple-200';
      case 'payment_received':
        return 'bg-yellow-100 border-yellow-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

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
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Kelola sistem dan pantau aktivitas platform
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Total Users */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Users
                          </dt>
                          <dd className="text-2xl font-bold text-gray-900">
                            {stats?.totalUsers || 0}
                          </dd>
                          <dd className="text-xs text-green-600 mt-1">
                            +12% dari bulan lalu
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Organizers */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Event Organizers
                          </dt>
                          <dd className="text-2xl font-bold text-gray-900">
                            {stats?.totalEventOrganizers || 0}
                          </dd>
                          <dd className="text-xs text-green-600 mt-1">
                            +3 baru minggu ini
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Events */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Events
                          </dt>
                          <dd className="text-2xl font-bold text-gray-900">
                            {stats?.totalEvents || 0}
                          </dd>
                          <dd className="text-xs text-blue-600 mt-1">
                            {stats?.activeEvents || 0} aktif saat ini
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
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Ticket className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Tiket Terjual
                          </dt>
                          <dd className="text-2xl font-bold text-gray-900">
                            {stats?.totalTicketsSold?.toLocaleString('id-ID') || 0}
                          </dd>
                          <dd className="text-xs text-green-600 mt-1">
                            +8% dari bulan lalu
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
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Pendapatan
                          </dt>
                          <dd className="text-2xl font-bold text-gray-900">
                            {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : 'Rp 0'}
                          </dd>
                          <dd className="text-xs text-green-600 mt-1">
                            +15% dari bulan lalu
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
                        <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Events Aktif
                          </dt>
                          <dd className="text-2xl font-bold text-gray-900">
                            {stats?.activeEvents || 0}
                          </dd>
                          <dd className="text-xs text-gray-600 mt-1">
                            Sedang berlangsung
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Aktivitas Terbaru
                    </h3>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 leading-relaxed">
                              {activity.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(activity.timestamp), 'dd MMM yyyy HH:mm', { locale: undefined })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Aksi Cepat
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <Link
                        href="/admin/organizers"
                        className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Building2 className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">Kelola Event Organizers</p>
                          <p className="text-sm text-gray-600">Lihat dan kelola semua EO</p>
                        </div>
                      </Link>

                      <Link
                        href="/admin/events"
                        className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Calendar className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">Kelola Events</p>
                          <p className="text-sm text-gray-600">Pantau semua event di platform</p>
                        </div>
                      </Link>

                      <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Kelola Users</p>
                          <p className="text-sm text-gray-600">Lihat dan kelola semua user</p>
                        </div>
                      </Link>

                      <Link
                        href="/admin/reports"
                        className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-gray-900">Laporan & Analytics</p>
                          <p className="text-sm text-gray-600">Lihat laporan detail sistem</p>
                        </div>
                      </Link>

                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Pengaturan Sistem</p>
                          <p className="text-sm text-gray-600">Konfigurasi platform</p>
                        </div>
                      </Link>
                    </div>
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