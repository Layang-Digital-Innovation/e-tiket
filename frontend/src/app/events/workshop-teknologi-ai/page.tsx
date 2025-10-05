'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';

export default function WorkshopTeknologiAIPage() {
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const event = {
    id: 'workshop-teknologi-ai',
    title: 'Workshop Teknologi AI',
    description: 'Pelajari teknologi AI terdepan dan implementasinya dalam berbagai industri.',
    longDescription: `
      Bergabunglah dalam workshop teknologi AI yang komprehensif! Program ini mencakup:
      
      • Fundamental AI dan Machine Learning
      • Hands-on practice dengan tools terbaru
      • Case study implementasi AI di industri
      • Networking dengan praktisi AI
      • Sertifikat resmi dari institusi terkemuka
      
      Workshop ini dirancang untuk profesional, mahasiswa, dan siapa saja yang ingin memahami dan menerapkan teknologi AI dalam pekerjaan mereka.
    `,
    date: '2024-04-05',
    time: '09:00 - 17:00',
    location: 'Universitas Indonesia, Depok',
    address: 'Kampus UI Depok, Jawa Barat 16424',
    capacity: 350,
    currentCapacity: 260,
    organizer: {
      name: 'AI Indonesia Community',
      email: 'info@aiindonesia.org',
      phone: '+62 21 7654 3210',
    },
    tickets: [
      {
        id: 'student-ticket',
        name: 'Student Ticket',
        description: 'Tiket khusus untuk mahasiswa (wajib tunjukkan KTM)',
        price: 150000,
        maxQuantity: 100,
        soldQuantity: 75,
        isActive: true,
        benefits: ['Materi workshop', 'Lunch box', 'Sertifikat', 'Akses ke komunitas online', 'Student networking session'],
      },
      {
        id: 'professional-ticket',
        name: 'Professional Ticket',
        description: 'Tiket untuk profesional dan umum',
        price: 250000,
        maxQuantity: 150,
        soldQuantity: 120,
        isActive: true,
        benefits: [
          'Materi workshop lengkap',
          'Lunch & coffee break',
          'Sertifikat profesional',
          'Akses ke komunitas online',
          'Professional networking',
          'Digital resources',
        ],
      },
      {
        id: 'vip-ticket',
        name: 'VIP Ticket',
        description: 'Tiket VIP dengan akses eksklusif dan mentoring',
        price: 500000,
        maxQuantity: 50,
        soldQuantity: 35,
        isActive: true,
        benefits: [
          'Semua benefit Professional',
          'VIP networking access',
          'One-on-one mentoring',
          'Premium AI tools access',
          'Custom project development',
          'Industry case studies',
          'Direct access to experts',
        ],
      },
      {
        id: 'early-bird',
        name: 'Early Bird Special',
        description: 'Tiket early bird dengan harga spesial (terbatas)',
        price: 200000,
        maxQuantity: 50,
        soldQuantity: 30,
        isActive: true,
        benefits: [
          'Semua benefit Professional',
          'Early bird discount',
          'Priority seating',
          'Welcome kit',
          'Exclusive early bird group',
        ],
      },
    ]
  };

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

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = event.tickets.find(t => t.id === ticketId);
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const handlePurchase = () => {
    if (getTotalTickets() > 0) {
      setShowPurchaseModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h1>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {event.time}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detail Event</h2>
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700">
                  {event.longDescription}
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Lokasi</h3>
                  <p className="text-gray-600">{event.address}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Kapasitas</h3>
                  <p className="text-gray-600">{event.currentCapacity}/{event.capacity} peserta</p>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Pilih Tiket</h2>
              <div className="space-y-4">
                {event.tickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{ticket.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                        
                        {/* Benefits */}
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Yang Anda Dapatkan:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {ticket.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center">
                                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-semibold text-gray-900">
                              Rp {ticket.price.toLocaleString('id-ID')}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({ticket.maxQuantity - ticket.soldQuantity} tersisa)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex items-center space-x-2">
                        <button
                          onClick={() => handleTicketQuantityChange(ticket.id, Math.max(0, (selectedTickets[ticket.id] || 0) - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          disabled={!selectedTickets[ticket.id]}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {selectedTickets[ticket.id] || 0}
                        </span>
                        <button
                          onClick={() => handleTicketQuantityChange(ticket.id, (selectedTickets[ticket.id] || 0) + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                          disabled={ticket.soldQuantity >= ticket.maxQuantity}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Penyelenggara</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{event.organizer.name}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{event.organizer.email}</p>
                  <p>{event.organizer.phone}</p>
                </div>
              </div>
            </div>

            {/* Purchase Summary */}
            {getTotalTickets() > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Pembelian</h3>
                <div className="space-y-2">
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
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handlePurchase}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Beli Tiket
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Konfirmasi Pembelian</h3>
            <p className="text-gray-600 mb-6">
              Anda akan membeli {getTotalTickets()} tiket untuk {event.title} dengan total Rp {getTotalPrice().toLocaleString('id-ID')}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <Link
                href="/purchase"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
              >
                Lanjutkan
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}