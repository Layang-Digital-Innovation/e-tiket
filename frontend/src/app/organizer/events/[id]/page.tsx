'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';

export default function EOEventDetailPage({ params }: { params: { id: string } }) {
  const [event] = useState({
    id: params.id,
    title: 'Konser Musik Jazz',
    description: 'Nikmati malam yang penuh dengan alunan musik jazz dari musisi terbaik Indonesia dan internasional. Event ini akan menghadirkan pengalaman musik yang tak terlupakan.',
    startDate: '2024-02-15T19:00:00',
    endDate: '2024-02-15T23:00:00',
    location: 'Jakarta Convention Center',
    maxCapacity: 500,
    currentCapacity: 350,
    price: 150000,
    isActive: true,
    createdAt: '2024-01-10',
    tickets: [
      {
        id: '1',
        name: 'Regular',
        price: 150000,
        maxQuantity: 300,
        soldQuantity: 200,
        isActive: true,
      },
      {
        id: '2',
        name: 'VIP',
        price: 300000,
        maxQuantity: 100,
        soldQuantity: 80,
        isActive: true,
      },
      {
        id: '3',
        name: 'VVIP',
        price: 500000,
        maxQuantity: 50,
        soldQuantity: 30,
        isActive: true,
      },
    ],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/eo/events" className="text-gray-700 hover:text-gray-900">
                  My Events
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">{event.title}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {event.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
                <span className="text-sm text-gray-500">
                  Dibuat: {new Date(event.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Edit Event
              </button>
              <Link
                href={`/eo/events/${event.id}/tickets`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Kelola Tiket
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Details */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Detail Event
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Deskripsi
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{event.description}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kapasitas Maksimal
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{event.maxCapacity} orang</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tiket Terjual
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{event.currentCapacity} tiket</p>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Statistik
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress Penjualan</span>
                      <span className="font-medium">
                        {Math.round((event.currentCapacity / event.maxCapacity) * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(event.currentCapacity / event.maxCapacity) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Pendapatan</span>
                      <span className="font-medium">Rp 87.5M</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickets Summary */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Ringkasan Tiket
                </h2>
                <div className="space-y-3">
                  {event.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ticket.name}</p>
                        <p className="text-xs text-gray-500">
                          Rp {ticket.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {ticket.soldQuantity}/{ticket.maxQuantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.round((ticket.soldQuantity / ticket.maxQuantity) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Aksi Cepat
                </h2>
                <div className="space-y-3">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    📊 Lihat Laporan Penjualan
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    📧 Kirim Email ke Peserta
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    📱 Bagikan Event
                  </button>
                  <Link
                    href={`/event/${event.id}`}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    👁️ Lihat Halaman Publik
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}