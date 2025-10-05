'use client';

import { useState } from 'react';
import Header from '@/components/header';

export default function AdminEventsPage() {
  const [events] = useState([
    {
      id: '1',
      title: 'Konser Musik Jazz',
      organizer: 'PT. Event Keren',
      startDate: '2024-02-15',
      endDate: '2024-02-15',
      location: 'Jakarta Convention Center',
      maxCapacity: 500,
      currentCapacity: 350,
      price: 150000,
      isActive: true,
    },
    {
      id: '2',
      title: 'Workshop Digital Marketing',
      organizer: 'CV. Organizer Pro',
      startDate: '2024-02-20',
      endDate: '2024-02-21',
      location: 'Hotel Santika Jakarta',
      maxCapacity: 100,
      currentCapacity: 85,
      price: 500000,
      isActive: true,
    },
    {
      id: '3',
      title: 'Festival Kuliner Nusantara',
      organizer: 'PT. Event Keren',
      startDate: '2024-03-01',
      endDate: '2024-03-03',
      location: 'Lapangan Banteng',
      maxCapacity: 1000,
      currentCapacity: 120,
      price: 50000,
      isActive: true,
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Semua Events
            </h1>
            <div className="flex space-x-3">
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">Semua Organizer</option>
                <option value="1">PT. Event Keren</option>
                <option value="2">CV. Organizer Pro</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {event.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {event.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Organizer:</span> {event.organizer}
                    </p>
                    <p>
                      <span className="font-medium">Tanggal:</span>{' '}
                      {new Date(event.startDate).toLocaleDateString('id-ID')}
                      {event.startDate !== event.endDate && 
                        ` - ${new Date(event.endDate).toLocaleDateString('id-ID')}`
                      }
                    </p>
                    <p>
                      <span className="font-medium">Lokasi:</span> {event.location}
                    </p>
                    <p>
                      <span className="font-medium">Kapasitas:</span>{' '}
                      {event.currentCapacity} / {event.maxCapacity}
                    </p>
                    <p>
                      <span className="font-medium">Harga:</span>{' '}
                      Rp {event.price.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(event.currentCapacity / event.maxCapacity) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((event.currentCapacity / event.maxCapacity) * 100)}% terisi
                    </p>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                      Lihat Detail
                    </button>
                    <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                      Laporan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}