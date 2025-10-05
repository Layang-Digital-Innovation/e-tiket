import Link from "next/link";
import { Calendar, Ticket, Users, Star, ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import HeroSlider from "@/components/HeroSlider";

export default function Home() {
  const heroImages = [
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Concert
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Conference
    "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80", // Festival
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Sports
  ];

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section with Image Slider */}
      <HeroSlider heroImages={heroImages} />

      {/* Featured Event Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-pt-serif md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Event Unggulan
            </h2>
            <p className="text-xl font-heebo text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              ayo join event unggulan kami dan nikmati pengalaman event terbaru!
            </p>
          </div>
          
          {/* Single Featured Event - Full Width Banner */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Event Image */}
              <div className="relative h-64 lg:h-96">
                <Image
                  src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Jakarta Music Festival 2024"
                  width={1200}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Event Details */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="mb-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Jakarta Music Festival 2024
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Festival musik terbesar dengan lineup artis internasional dan lokal terbaik. Nikmati pengalaman musik yang tak terlupakan dengan teknologi sound system terdepan dan stage production yang spektakuler.
                  </p>
                </div>
                
                {/* Event Info Grid */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">TANGGAL</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">15 Maret 2024</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sabtu, 19:00 WIB</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">LOKASI</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Jakarta Convention Center</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Hall A - Senayan, Jakarta</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Ticket className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">HARGA</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">Rp 250.000</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Mulai dari</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">STATUS</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">Tersedia</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">500+ tiket tersisa</p>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="flex-1 bg-primary text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors text-center inline-flex items-center justify-center"
                  >
                    <Ticket className="mr-2 h-5 w-5" />
                    Beli Tiket Sekarang
                  </Button>
                  <Button
                   variant={"outline"}
                    className="flex-1 border-2 border-primary text-primary rounded-lg text-lg font-semibold hover:bg-primary transition-colors text-center inline-flex items-center justify-center"
                  >
                    Detail Event
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Kadin Event Section */}
      <section className="py-20 bg-white dark:bg-gray-800 font-heebo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-pt-serif md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Kenapa Harus Ikut Event Kadin?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Bergabunglah dengan ekosistem bisnis terbesar Indonesia dan kembangkan jaringan usaha Anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-blue-50 dark:bg-gray-700">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Networking Berkualitas
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Bertemu dengan para pengusaha, investor, dan decision maker dari berbagai industri
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-green-50 dark:bg-gray-700">
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Peluang Bisnis Baru
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Temukan peluang kerjasama, partnership, dan ekspansi bisnis yang menguntungkan
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-purple-50 dark:bg-gray-700">
              <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Knowledge Sharing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Dapatkan insight terbaru tentang tren bisnis, regulasi, dan strategi pengembangan usaha
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Stakeholder Event Kadin
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Ekosistem lengkap yang mendukung kesuksesan event dan pengembangan bisnis Anda
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Tenant */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Tenant</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Penyewa booth dan ruang pameran untuk showcase produk dan layanan
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Booth Premium</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Display Area</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Meeting Room</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-center">
                <div className="bg-green-100 dark:bg-green-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Ticket className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Seller</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Penjual produk dan jasa yang berpartisipasi dalam event
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Product Launch</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Direct Sales</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Brand Exposure</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Partner */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Media Partner</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Partner media untuk publikasi dan promosi event
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Press Coverage</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Digital Promotion</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Live Streaming</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Komunitas */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-center">
                <div className="bg-orange-100 dark:bg-orange-900 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Komunitas</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  Komunitas bisnis dan profesional yang aktif berpartisipasi
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Business Network</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Knowledge Hub</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Collaboration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Bergabung dengan Event Kadin</h3>
              <p className="mb-6">Jadilah bagian dari ekosistem bisnis terbesar Indonesia dan kembangkan jaringan usaha Anda bersama para pelaku bisnis terkemuka.</p>
              <Link href="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
                Daftar Event Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Membuat Event Pertama Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabunglah dengan ribuan event organizer yang sudah mempercayai platform kami
          </p>
          <Link href="/register" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center">
            Mulai Sekarang
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Ticket className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">TicketHub</span>
              </div>
              <p className="text-gray-400">
                Platform tiket event terdepan di Indonesia
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/events" className="hover:text-white">Jelajahi Event</Link></li>
                <li><Link href="/eo/events/create" className="hover:text-white">Buat Event</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Harga</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Dukungan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Bantuan</Link></li>
                <li><Link href="/contact" className="hover:text-white">Kontak</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Perusahaan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">Tentang Kami</Link></li>
                <li><Link href="/careers" className="hover:text-white">Karir</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privasi</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TicketHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
