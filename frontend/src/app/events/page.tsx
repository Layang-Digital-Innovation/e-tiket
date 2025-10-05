'use client';

import Link from 'next/link';
import Header from '@/components/header';

export default function EventsPage() {
  const events = [
    {
      id: 'konser-musik-jazz',
      title: 'Konser Musik Jazz',
      description: 'Nikmati malam yang penuh dengan musik jazz dari musisi terbaik Indonesia.',
      date: '2024-03-15',
      time: '19:00',
      location: 'Jakarta Convention Center',
      image: '🎷',
      price: 150000,
      category: 'Musik',
      status: 'available',
      href: '/events/konser-musik-jazz'
    },
    {
      id: 'festival-kuliner-nusantara',
      title: 'Festival Kuliner Nusantara',
      description: 'Jelajahi cita rasa autentik dari berbagai daerah di Indonesia.',
      date: '2024-03-20',
      time: '10:00',
      location: 'Lapangan Banteng, Jakarta',
      image: '🍜',
      price: 75000,
      category: 'Kuliner',
      status: 'available',
      href: '/events/festival-kuliner-nusantara'
    },
    {
      id: 'workshop-teknologi-ai',
      title: 'Workshop Teknologi AI',
      description: 'Pelajari teknologi AI terdepan dan implementasinya dalam berbagai industri.',
      date: '2024-04-05',
      time: '09:00',
      location: 'Universitas Indonesia, Depok',
      image: '🤖',
      price: 250000,
      category: 'Teknologi',
      status: 'available',
      href: '/events/workshop-teknologi-ai'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Event Terbaru
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Temukan berbagai event menarik yang telah kami siapkan khusus untuk Anda. 
              Dari musik, kuliner, hingga teknologi - semuanya ada di sini!
            </p>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-6xl">{event.image}</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                      {event.category}
                    </span>
                    <span className="text-green-600 text-sm font-medium">
                      {event.status === 'available' ? 'Tersedia' : 'Sold Out'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })} • {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      Mulai dari Rp {event.price.toLocaleString('id-ID')}
                    </span>
                    <Link 
                      href={event.href}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tidak Menemukan Event yang Anda Cari?
              </h2>
              <p className="text-gray-600 mb-6">
                Hubungi tim kami untuk informasi event lainnya atau saran event yang ingin Anda adakan.
              </p>
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}