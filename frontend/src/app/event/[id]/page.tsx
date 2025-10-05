'use client';

import { useState } from 'react';
import Header from '@/components/header';

export default function PublicEventPage({ params }: { params: { id: string } }) {
  const [event] = useState({
    id: params.id,
    title: 'Konser Musik Jazz',
    description: 'Nikmati malam yang penuh dengan alunan musik jazz dari musisi terbaik Indonesia dan internasional. Event ini akan menghadirkan pengalaman musik yang tak terlupakan dengan suasana yang intim dan berkelas.',
    longDescription: `
      Bergabunglah dengan kami dalam malam yang penuh dengan harmoni musik jazz yang memukau. Event ini akan menampilkan:
      
      • Pertunjukan dari musisi jazz terbaik Indonesia dan internasional
      • Suasana yang intim dan berkelas di venue premium
      • Makanan dan minuman berkualitas tinggi
      • Pengalaman musik yang tak terlupakan
      
      Jangan lewatkan kesempatan untuk menikmati musik jazz berkualitas tinggi dalam suasana yang hangat dan bersahabat.
    `,
    startDate: '2024-02-15T19:00:00',
    endDate: '2024-02-15T23:00:00',
    location: 'Jakarta Convention Center',
    address: 'Jl. Gatot Subroto, Jakarta Pusat, DKI Jakarta',
    maxCapacity: 500,
    currentCapacity: 350,
    organizer: {
      name: 'Jazz Indonesia',
      email: 'info@jazzindonesia.com',
      phone: '+62 21 1234 5678',
    },
    image: '/api/placeholder/800/400',
    tickets: [
      {
        id: '1',
        name: 'Regular',
        description: 'Tiket reguler dengan akses standar ke venue',
        price: 150000,
        maxQuantity: 300,
        soldQuantity: 200,
        isActive: true,
        benefits: ['Akses ke venue utama', 'Welcome drink', 'Program acara'],
      },
      {
        id: '2',
        name: 'VIP',
        description: 'Tiket VIP dengan akses khusus dan fasilitas premium',
        price: 300000,
        maxQuantity: 100,
        soldQuantity: 80,
        isActive: true,
        benefits: [
          'Akses ke venue utama',
          'Akses ke area VIP',
          'Welcome drink premium',
          'Makanan ringan',
          'Program acara',
          'Merchandise eksklusif',
        ],
      },
      {
        id: '3',
        name: 'VVIP',
        description: 'Tiket VVIP dengan akses eksklusif dan meet & greet',
        price: 500000,
        maxQuantity: 50,
        soldQuantity: 30,
        isActive: true,
        benefits: [
          'Semua benefit VIP',
          'Meet & greet dengan artis',
          'Foto bersama artis',
          'Akses ke backstage',
          'Dinner eksklusif',
          'Merchandise limited edition',
        ],
      },
    ],
  });

  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const handleTicketQuantityChange = (ticketId: string, quantity: number) => {
    if (quantity === 0) {
      const newSelected = { ...selectedTickets };
      delete newSelected[ticketId];
      setSelectedTickets(newSelected);
    } else {
      setSelectedTickets({
        ...selectedTickets,
        [ticketId]: quantity,
      });
    }
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = event.tickets.find(t => t.id === ticketId);
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0);
  };

  const handlePurchase = () => {
    if (getTotalTickets() > 0) {
      setShowPurchaseModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Hero Section */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="h-64 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                <p className="text-xl opacity-90">
                  {new Date(event.startDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Tentang Event
                </h2>
                <p className="text-gray-700 mb-4">{event.description}</p>
                <div className="whitespace-pre-line text-gray-600">
                  {event.longDescription}
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Detail Event
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">📅</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Tanggal & Waktu</p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startDate).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.startDate).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} - {new Date(event.endDate).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} WIB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">📍</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Lokasi</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                        <p className="text-sm text-gray-500">{event.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Kapasitas</p>
                        <p className="text-sm text-gray-600">
                          {event.currentCapacity} / {event.maxCapacity} peserta
                        </p>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(event.currentCapacity / event.maxCapacity) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">🏢</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Penyelenggara</p>
                        <p className="text-sm text-gray-600">{event.organizer.name}</p>
                        <p className="text-sm text-gray-500">{event.organizer.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tickets */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Pilih Tiket
                </h2>
                <div className="space-y-4">
                  {event.tickets.filter(ticket => ticket.isActive).map((ticket) => {
                    const remaining = ticket.maxQuantity - ticket.soldQuantity;
                    const isAvailable = remaining > 0;
                    
                    return (
                      <div
                        key={ticket.id}
                        className={`border rounded-lg p-4 ${
                          isAvailable ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {ticket.name}
                              </h3>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">
                                  Rp {ticket.price.toLocaleString('id-ID')}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {isAvailable ? `${remaining} tersisa` : 'Sold Out'}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-3">{ticket.description}</p>
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Benefit yang didapat:
                              </p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {ticket.benefits.map((benefit, index) => (
                                  <li key={index} className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {isAvailable && (
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Jumlah:
                                </span>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleTicketQuantityChange(
                                      ticket.id,
                                      Math.max(0, (selectedTickets[ticket.id] || 0) - 1)
                                    )}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center">
                                    {selectedTickets[ticket.id] || 0}
                                  </span>
                                  <button
                                    onClick={() => handleTicketQuantityChange(
                                      ticket.id,
                                      Math.min(remaining, (selectedTickets[ticket.id] || 0) + 1)
                                    )}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Purchase Summary */}
              <div className="bg-white shadow rounded-lg p-6 sticky top-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Ringkasan Pembelian
                </h3>
                {getTotalTickets() > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                      const ticket = event.tickets.find(t => t.id === ticketId);
                      if (!ticket) return null;
                      
                      return (
                        <div key={ticketId} className="flex justify-between text-sm">
                          <span>{ticket.name} x{quantity}</span>
                          <span>Rp {(ticket.price * quantity).toLocaleString('id-ID')}</span>
                        </div>
                      );
                    })}
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-medium">
                        <span>Total ({getTotalTickets()} tiket)</span>
                        <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    <button
                      onClick={handlePurchase}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-md font-medium mt-4"
                    >
                      Beli Tiket
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Pilih tiket untuk melanjutkan pembelian
                  </p>
                )}
              </div>

              {/* Share Event */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Bagikan Event
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border">
                    📱 Bagikan ke WhatsApp
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border">
                    📘 Bagikan ke Facebook
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border">
                    🐦 Bagikan ke Twitter
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border">
                    📧 Bagikan via Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Konfirmasi Pembelian
              </h3>
              <div className="space-y-3 mb-6">
                {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                  const ticket = event.tickets.find(t => t.id === ticketId);
                  if (!ticket) return null;
                  
                  return (
                    <div key={ticketId} className="flex justify-between text-sm">
                      <span>{ticket.name} x{quantity}</span>
                      <span>Rp {(ticket.price * quantity).toLocaleString('id-ID')}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Anda akan diarahkan ke halaman pembayaran untuk menyelesaikan transaksi.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement payment flow
                    alert('Fitur pembayaran akan segera tersedia!');
                    setShowPurchaseModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Lanjut ke Pembayaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}