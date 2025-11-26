import PublicLayout from "@/components/layouts/PublicLayout";

export default function TermsAndConditionsPage() {
    return (
        <PublicLayout>
            <div className="min-h-screen bg-background py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Syarat dan Ketentuan
                    </h1>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Ketentuan Umum</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Dengan mengakses dan menggunakan situs web Naik Kelas, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan kami.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Pembelian Tiket</h2>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                <li>Setiap pembelian tiket bersifat final dan tidak dapat dibatalkan kecuali dinyatakan lain oleh penyelenggara.</li>
                                <li>Harga tiket dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.</li>
                                <li>Anda bertanggung jawab untuk memastikan data pemesanan yang dimasukkan adalah benar.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Penggunaan E-Tiket</h2>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                <li>E-tiket yang valid adalah yang diterbitkan melalui sistem kami.</li>
                                <li>Dilarang keras menggandakan, memalsukan, atau menjual kembali e-tiket tanpa izin.</li>
                                <li>Penyelenggara berhak menolak masuk jika ditemukan indikasi kecurangan.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Pembatasan Tanggung Jawab</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Naik Kelas tidak bertanggung jawab atas kerugian yang timbul akibat pembatalan event, perubahan jadwal, atau kelalaian penyelenggara event. Kami hanya bertindak sebagai platform penjualan tiket.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Perubahan Syarat</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Kami berhak untuk mengubah Syarat dan Ketentuan ini kapan saja. Perubahan akan berlaku efektif segera setelah diposting di situs web.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
