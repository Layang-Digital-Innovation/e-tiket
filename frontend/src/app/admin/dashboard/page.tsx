'use client';

import { useAdminDashboard } from '@/hooks/useAdmin';
import { Loader2, Users, Building2, Calendar, Ticket, DollarSign, TrendingUp, UserPlus, FileText, QrCode, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
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

              {/* Operational Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Check-in Card */}
                <button
                  onClick={() => router.push('/checkin')}
                  className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105 text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Check-in Peserta</h3>
                      </div>
                      <p className="text-sm text-gray-600">Scan QR code untuk check-in wristband peserta</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Redeem Card */}
                <button
                  onClick={() => router.push('/redeem')}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-all hover:scale-105 text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Ticket className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Redeem Tiket</h3>
                      </div>
                      <p className="text-sm text-gray-600">Tukarkan tiket dengan wristband peserta</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
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
                          <dd className={`text-xs mt-1 ${stats?.growth?.users.percentage !== undefined && stats.growth.users.percentage < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {stats?.growth?.users.percentage !== undefined
                              ? `${stats.growth.users.percentage >= 0 ? '+' : ''}${stats.growth.users.percentage}% ${stats.growth.users.period}`
                              : '+0% bulan lalu'
                            }
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
                            {stats?.growth?.eventOrganizers.count !== undefined
                              ? `+${stats.growth.eventOrganizers.count} ${stats.growth.eventOrganizers.period}`
                              : '+0 minggu ini'
                            }
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
                          <dd className={`text-xs mt-1 ${stats?.growth?.ticketsSold.percentage !== undefined && stats.growth.ticketsSold.percentage < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {stats?.growth?.ticketsSold.percentage !== undefined
                              ? `${stats.growth.ticketsSold.percentage >= 0 ? '+' : ''}${stats.growth.ticketsSold.percentage}% ${stats.growth.ticketsSold.period}`
                              : '+0% bulan lalu'
                            }
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
                          <dd className={`text-xs mt-1 ${stats?.growth?.revenue.percentage !== undefined && stats.growth.revenue.percentage < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {stats?.growth?.revenue.percentage !== undefined
                              ? `${stats.growth.revenue.percentage >= 0 ? '+' : ''}${stats.growth.revenue.percentage}% ${stats.growth.revenue.period}`
                              : '+0% bulan lalu'
                            }
                          </dd>
                        </dl>
                      </div>
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