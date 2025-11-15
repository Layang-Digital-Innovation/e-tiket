# Panduan Implementasi Webinar Online (Gratis & Berbayar)

Dokumen ini menjelaskan alur end-to-end untuk memberikan akses webinar (misal Zoom) kepada peserta event online, baik kategori gratis maupun berbayar, dengan perubahan minimal terhadap fitur yang sudah ada.

## Tujuan
- Peserta mendapatkan akses ke webinar via endpoint aman (bukan raw link di email).
- Gratis: akses diberikan saat order dikonfirmasi (total = 0).
- Berbayar: akses diberikan setelah pembayaran sukses (PAID).
- Reminder email otomatis sebelum event.

## Peran & Audiens
- Organizer/Admin: mengonfigurasi detail webinar pada event.
- Attendee: menerima email akses dan bergabung via tombol “Gabung Webinar”.

---

## Perubahan Data (Minimal)

- Event (tambah kolom):
  - `deliveryMode: ONLINE | ONSITE | HYBRID` (default ONSITE)
  - `webinarJoinUrl: string`
  - `webinarStartAt: datetime`
  - `webinarEndAt: datetime`
  - `webinarLobbyOpenMinutes: number` (mis. 15)
  - Catatan: Untuk tipe event seperti `SEMINAR` yang online, gunakan `deliveryMode = ONLINE` untuk mengaktifkan alur webinar.

- Ticket (opsional, fase selanjutnya):
  - `webinarFirstJoinedAt`, `webinarLastJoinedAt`, `webinarJoinCount` (untuk analitik)
  - Tidak menyimpan `webinarJoinUrl` di Ticket.

Catatan: Untuk event online, sarankan `RedeemStrategy = NONE`. Flow redeem/check-in tidak perlu diubah.

---

## API Konfigurasi & Akses

- Organizer set webinar (admin/organizer):
  - `PATCH /api/events/:eventId/webinar`
  - Body:
    - `deliveryMode`, `webinarJoinUrl`, `webinarStartAt`, `webinarEndAt`, `webinarLobbyOpenMinutes`

- Attendee akses webinar (Phase 1 - Default):
  - Link Zoom dikirim langsung di email (tanpa melewati endpoint akses).
  - Dianjurkan menyertakan waktu event dan catatan jangan membagikan link.
  - Optional: cantumkan link ke halaman tiket sebagai fallback (tanpa gate).

- Attendee akses webinar (Phase 2 - Opsional, lebih aman):
  - `GET /api/events/:eventId/webinar/access?ticketCode=...` (gate aman)
  - Validasi kepemilikan & window waktu sebelum mengembalikan/redirect joinUrl.
  - Berguna untuk kontrol akses, rate limiting, dan logging.

### Contoh Kontrak API (Phase 2 - Opsional)

- PATCH `/api/events/:eventId/webinar`

  Request:

  ```json
  {
    "deliveryMode": "ONLINE",
    "webinarJoinUrl": "https://zoom.us/j/123456789?pwd=...",
    "webinarStartAt": "2025-12-10T13:00:00+07:00",
    "webinarEndAt": "2025-12-10T15:00:00+07:00",
    "webinarLobbyOpenMinutes": 15
  }
  ```

  Response: 200 OK (event updated)

- GET `/api/events/:eventId/webinar/access?ticketCode=TKT-ABC123`

  Response (waiting):

  ```json
  {
    "status": "waiting",
    "startAt": "2025-12-10T13:00:00+07:00",
    "endAt": "2025-12-10T15:00:00+07:00"
  }
  ```

  Response (live):

  ```json
  {
    "status": "live",
    "joinUrl": "https://zoom.us/j/123456789?pwd=...",
    "startAt": "2025-12-10T13:00:00+07:00",
    "endAt": "2025-12-10T15:00:00+07:00"
  }
  ```

---

## Seminar Online – Jalur Cepat (Tanpa Payment)

- Gunakan kategori tiket gratis (`price = 0`).
- Saat order total = 0:
  - Tandai order sebagai `PAID/CONFIRMED` instan.
  - Generate tiket.
  - Kirim email “Akses Webinar” berisi link Zoom langsung (Phase 1) atau tombol ke endpoint akses (Phase 2).
- Dapat diterapkan khusus untuk `EventType.SEMINAR` dengan `deliveryMode = ONLINE`.

Catatan: Jika kebijakan mengizinkan, link Zoom dapat di-embed langsung pada email untuk SEMINAR gratis. Namun disarankan tetap pakai endpoint akses untuk kontrol waktu & keamanan.

---

## Alur Backend

- Gratis (total = 0):
  - Order dibuat → langsung set `status = PAID/CONFIRMED` (tanpa invoice).
  - Generate tiket → kirim email “Akses Webinar” berisi link Zoom langsung.
- Berbayar:
  - Order dibuat → email “Menunggu Pembayaran”.
  - Saat webhook/payment success → set `status = PAID` → kirim email “Akses Webinar”.

- Reminder Jobs (Bull/cron):
  - 24 jam sebelum `webinarStartAt`: kirim reminder ke semua tiket berhak.
  - 1 jam sebelum `webinarStartAt`: kirim reminder.
  - Opsional: “Sedang dimulai” saat jam mulai.

---

## Konten Email

- Akses Webinar (gratis vs berbayar sama; beda trigger):
  - Subject: “[{EventTitle}] Akses Webinar Anda”
  - Body:
    - Salam + ringkasan jadwal (`webinarStartAt`/`EndAt`, timezone lokal)
    - Phase 1 (default): link Zoom langsung di email.
    - Phase 2 (opsional): tombol “Gabung Webinar” → `GET /webinar/access?ticketCode=...`
    - Catatan organizer (`webinarNotes` bila ada)
  - Keamanan: Jangan tampilkan passcode/link raw di email.

- Menunggu Pembayaran (berbayar):
  - Subject: “[{EventTitle}] Menunggu Pembayaran”
  - Body: Link pembayaran (existing), batas waktu, bantuan.

- Reminder 24 jam & 1 jam:
  - Subject: “[{EventTitle}] Mulai besok/1 jam lagi”
  - Body: Jadwal + tombol “Gabung Webinar”.

- Setelah Event (opsional):
  - Subject: “[{EventTitle}] Terima kasih”
  - Body: Rekaman/materi jika tersedia.

### Contoh Template (Ringkas)

- Akses Webinar (gratis/berbayar):

  Subject: `[{{EventTitle}}] Akses Webinar Anda`

  Body:

  ```
  Halo {{AttendeeName}},

  Webinar {{EventTitle}} akan berlangsung pada {{StartLocal}} s/d {{EndLocal}} ({{Timezone}}).

  Silakan gunakan link berikut untuk bergabung saat waktu sudah dimulai:
  {{WebinarJoinUrl}}

  {{WebinarNotes}}
  ```

---

## Frontend (Minimal)

- Organizer:
  - Form di halaman edit event untuk set `deliveryMode`, `webinarJoinUrl`, `webinarStartAt/EndAt`, `webinarLobbyOpenMinutes`.
- Attendee:
  - Halaman tiket menampilkan status webinar:
    - `waiting`: countdown
    - `live`: tombol “Gabung Webinar”
    - `ended`: pesan selesai
  - Tombol memanggil endpoint akses; browser redirect jika URL diberikan.

---

## Keamanan

- Phase 1 (default): link Zoom dikirim langsung di email → cepat, namun lebih mudah dibagikan.
- Mitigasi cepat:
  - Sertakan catatan “Jangan membagikan link ini” di email.
  - Ganti link meeting jika terjadi kebocoran (opsional by organizer).
  - Gunakan waiting room/password di Zoom.
- Phase 2 (opsional): gunakan endpoint akses aman untuk kontrol window, logging, rate limit, dan single-session.

Tambahan (opsional, fase 2):
- Short-lived signed URL atau redirect 302 dari backend.
- Single-session guard (blokir join ganda).
- Logging ke tabel `webinar_access_logs` (analitik & audit).

---

## Flow Ringkas

- Gratis:
  1. User checkout kategori harga 0 → order tersimpan (status confirmed/paid instan)
  2. Generate tiket
  3. Kirim email “Akses Webinar”
  4. Reminder H-1 / H-1 jam
  5. Attendee klik “Gabung Webinar” → endpoint akses → join

- Berbayar:
  1. User checkout → email “Menunggu Pembayaran”
  2. Bayar sukses (webhook) → set PAID
  3. Kirim email “Akses Webinar”
  4. Reminder H-1 / H-1 jam
  5. Attendee klik “Gabung Webinar” → endpoint akses → join

---

## Checklist Implementasi

- Database:
  - Migration kolom Event (5 kolom di atas)
- Backend:
  - `PATCH /events/:id/webinar`
  - `GET /events/:eventId/webinar/access`
  - Hook email:
    - Gratis: kirim saat order confirmed/paid instan
    - Berbayar: kirim saat status PAID (webhook)
  - Job reminder 24h & 1h (Bull/cron)
- Frontend:
  - Form konfigurasi webinar (organizer)
  - Tombol join + status di halaman tiket (attendee)

### Contoh Migration (DDL minimal – TypeORM)

```ts
// events table additions
@Column({ type: 'enum', enum: ['ONLINE','ONSITE','HYBRID'], default: 'ONSITE' })
deliveryMode: 'ONLINE'|'ONSITE'|'HYBRID';

@Column({ type: 'varchar', length: 500, nullable: true })
webinarJoinUrl?: string;

@Column({ type: 'timestamptz', nullable: true })
webinarStartAt?: Date;

@Column({ type: 'timestamptz', nullable: true })
webinarEndAt?: Date;

@Column({ type: 'int', default: 15 })
webinarLobbyOpenMinutes: number;
```

---

## Uji Coba

- Unit:
  - Validasi access endpoint (status order, window waktu, ownership)
- Integrasi:
  - Gratis: buat order total 0 → verifikasi email akses terkirim
  - Berbayar: simulasi webhook PAID → verifikasi email akses terkirim
- E2E:
  - Akses sebelum lobby → “waiting”
  - Saat live → joinUrl dikembalikan/redirect
  - Setelah end → “ended”

---

## Rollout

- Deploy migration Event
- Rilis endpoint konfigurasi webinar + akses
- Aktifkan jobs reminder
- Tambah UI organizer + tombol join attendee (bisa bertahap; sementara gunakan Postman untuk set webinar)

---

## Acceptance Criteria

- Organizer dapat mengatur webinar pada event (PATCH berhasil, data tersimpan).
- Order gratis otomatis mengirim email akses webinar setelah order dibuat.
- Order berbayar mengirim email akses webinar setelah pembayaran sukses.
- Endpoint akses mengembalikan `waiting` sebelum window, `live` saat window, `ended` setelah selesai.
- Attendee dengan ticket valid dapat join via tombol dari email/halaman tiket.
- Tidak ada perubahan pada flow redeem/check-in/payout existing.

## Catatan Keputusan (Decision Log)

- Link webinar disimpan di level Event (single source of truth).
- Tidak menyimpan link di Ticket; hanya gunakan `ticketCode` untuk akses.
- Untuk SEMINAR online gratis, jalur cepat: kategori `price=0`, bypass payment, kirim email akses instan.
