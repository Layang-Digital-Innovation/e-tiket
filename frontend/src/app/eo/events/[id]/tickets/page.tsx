'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';

export default function EOTicketManagementPage({ params }: { params: { id: string } }) {
  const [tickets, setTickets] = useState([
    {
      id: '1',
      name: 'Regular',
      description: 'Tiket reguler dengan akses standar',
      price: 150000,
      maxQuantity: 300,
      soldQuantity: 200,
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'VIP',
      description: 'Tiket VIP dengan akses khusus dan fasilitas premium',
      price: 300000,
      maxQuantity: 100,
      soldQuantity: 80,
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '3',
      name: 'VVIP',
      description: 'Tiket VVIP dengan akses eksklusif dan meet & greet',
      price: 500000,
      maxQuantity: 50,
      soldQuantity: 30,
      isActive: true,
      createdAt: '2024-01-15',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    name: '',
    description: '',
    price: '',
    maxQuantity: '',
  });

  const handleCreateTicket = () => {
    // TODO: Implement API call to create ticket
    const ticket = {
      id: Date.now().toString(),
      name: newTicket.name,
      description: newTicket.description,
      price: parseInt(newTicket.price),
      maxQuantity: parseInt(newTicket.maxQuantity),
      soldQuantity: 0,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTickets([...tickets, ticket]);
    setNewTicket({ name: '', description: '', price: '', maxQuantity: '' });
    setShowCreateModal(false);
  };

  const toggleTicketStatus = (ticketId: string) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, isActive: !ticket.isActive }
        : ticket
    ));
  };

  const deleteTicket = (ticketId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tiket ini?')) {
      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
    }
  };

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
                  <Link href={`/eo/events/${params.id}`} className="text-gray-700 hover:text-gray-900">
                    Event Detail
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">Kelola Tiket</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kelola Tiket</h1>
              <p className="mt-2 text-gray-600">
                Kelola jenis tiket dan harga untuk event Anda
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Tambah Tiket
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">🎫</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Jenis Tiket
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {tickets.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tiket Terjual
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {tickets.reduce((sum, ticket) => sum + ticket.soldQuantity, 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📦</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tiket Tersisa
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {tickets.reduce((sum, ticket) => sum + (ticket.maxQuantity - ticket.soldQuantity), 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">💰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Pendapatan
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Rp {tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.soldQuantity), 0).toLocaleString('id-ID')}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Daftar Tiket
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Kelola semua jenis tiket untuk event ini
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ticket.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {ticket.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {ticket.name}
                            </p>
                          </div>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500">
                              <p>{ticket.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-8">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Rp {ticket.price.toLocaleString('id-ID')}
                          </p>
                          <p className="text-sm text-gray-500">Harga</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {ticket.soldQuantity} / {ticket.maxQuantity}
                          </p>
                          <p className="text-sm text-gray-500">Terjual / Total</p>
                        </div>
                        <div className="text-right">
                          <div className="w-24">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>{Math.round((ticket.soldQuantity / ticket.maxQuantity) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(ticket.soldQuantity / ticket.maxQuantity) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleTicketStatus(ticket.id)}
                            className={`px-3 py-1 rounded text-xs font-medium ${
                              ticket.isActive
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {ticket.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTicket(ticket.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tambah Tiket Baru
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Tiket
                  </label>
                  <input
                    type="text"
                    value={newTicket.name}
                    onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Contoh: VIP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Deskripsi tiket..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    value={newTicket.price}
                    onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="150000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kuantitas Maksimal
                  </label>
                  <input
                    type="number"
                    value={newTicket.maxQuantity}
                    onChange={(e) => setNewTicket({ ...newTicket, maxQuantity: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateTicket}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Tambah Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}