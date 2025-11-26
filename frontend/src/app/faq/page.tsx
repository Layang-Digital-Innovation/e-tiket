import PublicLayout from "@/components/layouts/PublicLayout";

export default function FAQPage() {
    return (
        <PublicLayout>
            <div className="min-h-screen bg-background py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                        Frequently Asked Questions (FAQ)
                    </h1>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Bagaimana cara membeli tiket?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Anda dapat membeli tiket dengan memilih event yang diinginkan, klik tombol &quot;Beli Tiket&quot;, pilih kategori dan jumlah tiket, lalu selesaikan pembayaran melalui metode yang tersedia.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Metode pembayaran apa saja yang tersedia?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Kami menerima berbagai metode pembayaran termasuk transfer bank, e-wallet (GoPay, OVO, Dana), dan kartu kredit/debit.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Apakah tiket bisa direfund?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Kebijakan refund bergantung pada masing-masing penyelenggara event. Silakan cek detail kebijakan pada halaman event terkait atau hubungi layanan pelanggan kami.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Bagaimana jika saya belum menerima e-tiket?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                E-tiket akan dikirimkan ke email Anda setelah pembayaran berhasil. Jika belum menerima, silakan cek folder spam atau hubungi support kami dengan menyertakan bukti pembayaran.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
