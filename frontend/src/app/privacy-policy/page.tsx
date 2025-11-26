import PublicLayout from "@/components/layouts/PublicLayout";

export default function PrivacyPolicyPage() {
    return (
        <PublicLayout>
            <div className="min-h-screen bg-background py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                        Kebijakan Privasi
                    </h1>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Pendahuluan</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Kami di Naik Kelas menghargai privasi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan layanan kami.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. Informasi yang Kami Kumpulkan</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                Kami dapat mengumpulkan informasi berikut:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                <li>Informasi identitas pribadi (nama, alamat email, nomor telepon).</li>
                                <li>Informasi transaksi dan pembayaran.</li>
                                <li>Informasi teknis tentang perangkat dan penggunaan layanan.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Penggunaan Informasi</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                Informasi yang kami kumpulkan digunakan untuk:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                                <li>Memproses pesanan dan transaksi tiket Anda.</li>
                                <li>Mengirimkan konfirmasi dan tiket elektronik.</li>
                                <li>Memberikan layanan pelanggan dan dukungan.</li>
                                <li>Mengirimkan informasi tentang event dan promosi (jika Anda menyetujuinya).</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Keamanan Data</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi pribadi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Hubungi Kami</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui email atau WhatsApp yang tersedia di situs web kami.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
