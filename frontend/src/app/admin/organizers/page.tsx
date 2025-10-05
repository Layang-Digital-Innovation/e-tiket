'use client';

import { useState } from 'react';
import Header from '@/components/header';

export default function AdminOrganizersPage() {
  const [organizers] = useState([
    {
      id: '1',
      name: 'PT. Event Keren',
      email: 'contact@eventkeren.com',
      phone: '+62812345678',
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'CV. Organizer Pro',
      email: 'info@organizerpro.com',
      phone: '+62887654321',
      isActive: true,
      createdAt: '2024-01-10',
    },
    {
      id: '3',
      name: 'Event Management Inc',
      email: 'hello@eventmgmt.com',
      phone: '+62856789012',
      isActive: false,
      createdAt: '2024-01-05',
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Event Organizers
            </h1>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Tambah Organizer
            </button>
          </div>

          {/* Organizers Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {organizers.map((organizer) => (
                <li key={organizer.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {organizer.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {organizer.name}
                            </p>
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                organizer.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {organizer.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-gray-500">
                              {organizer.email} • {organizer.phone}
                            </p>
                            <p className="text-sm text-gray-500">
                              Bergabung: {new Date(organizer.createdAt).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">1</span> sampai{' '}
                  <span className="font-medium">3</span> dari{' '}
                  <span className="font-medium">3</span> hasil
                </p>
              </div>
              <div>
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
      </div>
    </div>
  );
}