import Link from "next/link";
import { Calendar, Ticket, Users, Star, ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import HeroSlider from "@/components/HeroSlider";
import PublicLayout from "@/components/layouts/PublicLayout";
import { HomeEventsCarousel } from "@/components/events/HomeEventsCarousel";
import assets1 from "@/assets/gambar1.png";
import assets2 from "@/assets/gambar2.png";
import assets3 from "@/assets/gambar3.png";
import assets4 from "@/assets/gambar4.png";
import client1 from "@/assets/Shopee.svg.png";
import client2 from "@/assets/client1.jpg";
import client3 from "@/assets/client2.jpg";
import client4 from "@/assets/client3.jpg";
import client5 from "@/assets/client4.jpg";
import naikKelas from "@/assets/naik_kelas_putih.png"

export default async function Home() {
  const heroImages = [
    assets1, // Concert
    assets2, // Conference
    assets3, // Festival
    assets4, // Sports
  ];

  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID_NAIK_KELLAS;

  let youtubeVideos: { id: string; title: string }[] = [];

  if (apiKey && channelId) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=6&type=video`,
        { next: { revalidate: 60 * 10 } }
      );

      if (res.ok) {
        const data = await res.json();
        youtubeVideos = (data.items || []).map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet?.title ?? "",
        }));
      }
    } catch (error) {
      // silent fail, will show fallback section
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section with Image Slider */}
        <HeroSlider heroImages={heroImages} />



        {/* Events Carousel Section */}
        <HomeEventsCarousel />

        {/* Why Join Kadin Event Section */}
        <section className="py-20 bg-white dark:bg-gray-950 font-heebo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-pt-serif md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Klien Naik Kelas
              </h2>
            </div>
            <div className="mt-10 overflow-hidden border-y border-gray-200 dark:border-gray-800 py-4">
              <div className="marquee flex gap-6">
                {[1, 2].map((loop) => (
                  <div key={loop} className="flex gap-6">
                    <div className="min-w-[120px] p-8 md:min-w-[140px] h-[70px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center">
                      <Image
                        src={client1}
                        alt="Logo klien Naik Kelas"
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                    <div className="min-w-[120px] md:min-w-[140px] h-[70px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center">
                      <Image
                        src={client2}
                        alt="Logo klien Naik Kelas"
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                    <div className="min-w-[120px] md:min-w-[140px] h-[70px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center">
                      <Image
                        src={client3}
                        alt="Logo klien Naik Kelas"
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                    <div className="min-w-[120px] md:min-w-[140px] h-[70px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center">
                      <Image
                        src={client4}
                        alt="Logo klien Naik Kelas"
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                    <div className="min-w-[120px] md:min-w-[140px] h-[70px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center">
                      <Image
                        src={client5}
                        alt="Logo klien Naik Kelas"
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Section - Naik Kellas Latest Videos (Thumbnail Only) */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Video Terbaru Naik Kellas
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Simak konten edukasi bisnis dan pengembangan diri dari channel YouTube Naik Kellas.
              </p>
            </div>

            {youtubeVideos.length > 0 ? (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {youtubeVideos.map((video) => (
                  <Link
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col group"
                  >
                    <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <Image
                        src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                        alt={video.title}
                        width={480}
                        height={270}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                        {video.title}
                      </h3>
                      <span className="mt-auto inline-flex items-center text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                        Tonton di YouTube
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-gray-700 dark:text-gray-200 mb-2 font-medium">
                  Video belum dapat ditampilkan.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-lg mx-auto">
                  Pastikan konfigurasi YouTube API sudah benar atau kunjungi langsung channel Naik Kellas di YouTube.
                </p>
                <Link
                  href="https://www.youtube.com/@naikkellas"
                  target="_blank"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white dark:border-gray-100 dark:text-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Buka Channel Naik Kellas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section to WhatsApp */}
        <section className="py-16 bg-gray-800 dark:bg-gray-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Saatnya bisnis kamu dikenal banyak orang!
                </h2>
                <p className="text-lg text-gray-300">
                  kami percaya cerita baik layak disampaikan dengan baik
                </p>
              </div>

              <div className="flex justify-center md:justify-end">
                <Link
                  href="https://wa.me/6285320695636"
                  target="_blank"
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-2 bg-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Hubungi via WhatsApp
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-primary text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div>
                <div className="mb-4">
                  <Image src={naikKelas} alt="naikkelas" width={200} height={200} />
                </div>
                <p className="text-gray-400">
                  media pengusaha muda untuk tumbuh naik kelas
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Site Map</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/events" className="hover:text-white">Jelajahi Event</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Sosial Media</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      href="https://www.youtube.com/@naikkellas"
                      target="_blank"
                      className="hover:text-white"
                    >
                      YouTube
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.tiktok.com/@naikkellas"
                      target="_blank"
                      className="hover:text-white"
                    >
                      TikTok
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.instagram.com/naikkellas"
                      target="_blank"
                      className="hover:text-white"
                    >
                      Instagram
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Bantuan & Legal</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-white">Kebijakan Privasi</Link></li>
                  <li><Link href="/terms-and-conditions" className="hover:text-white">Syarat & Ketentuan</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Hubungi Kami</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <p className="font-medium text-white">Alamat:</p>
                    <p>Jl. Siliwangi No.54, Kota Tasikmalaya</p>
                  </li>
                  <li>
                    <p className="font-medium text-white">Email:</p>
                    <a href="mailto:layanggroup@gmail.com" className="hover:text-white">layanggroup@gmail.com</a>
                  </li>
                  <li>
                    <p className="font-medium text-white">WhatsApp:</p>
                    <a href="https://wa.me/6285182322580" target="_blank" className="hover:text-white">0851-8232-2580</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Naik Kelas. All rights reserved.</p>
              <p>Developed by <a href="https://layangdigital.com" target="_blank" className="hover:text-white">Layang Digital Innovation</a></p>
            </div>
          </div>
        </footer>
      </div>
    </PublicLayout>
  );
}
