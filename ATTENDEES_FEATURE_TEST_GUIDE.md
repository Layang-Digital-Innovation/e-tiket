# Panduan Testing Fitur Kelola Peserta

## Prerequisites

1. **Event dengan Ticket yang Terjual**: Pastikan ada event yang sudah memiliki peserta/attendees
2. **Backend Running**: Backend harus berjalan di port yang benar
3. **Database**: Database harus memiliki data attendees dengan berbagai status

## Langkah Testing

### 1. Backend Testing

#### Test API Endpoint
```bash
# Get attendees for specific event (ganti {eventId} dengan UUID event yang valid)
curl -X GET "http://localhost:3000/api/attendees/event/{eventId}" \
  -H "Content-Type: application/json"

# Get attendees with status filter
curl -X GET "http://localhost:3000/api/attendees/event/{eventId}?status=UNUSED" \
  -H "Content-Type: application/json"

# Export attendees to CSV
curl -X GET "http://localhost:3000/api/attendees/event/{eventId}/export" \
  -H "Content-Type: application/json" \
  -o "attendees.csv"
```

#### Cek Logs
```bash
# Monitor backend logs untuk melihat query SQL dan debug info
tail -f backend_logs.log
```

### 2. Frontend Testing

#### A. Event Selector Page (`/organizer/attendees`)
- [ ] Halaman menampilkan grid event
- [ ] Event cards menampilkan informasi lengkap
- [ ] Button "Kelola Kehadiran" berfungsi
- [ ] Navigation ke halaman detail attendees benar

#### B. Event Attendees Page (`/organizer/events/[slug]/attendees`)
- [ ] Halaman load dengan benar setelah event ditemukan
- [ ] Statistics cards menampilkan angka yang benar
- [ ] Filter status berfungsi (All, UNUSED, REDEEMED, CHECKED_IN)
- [ ] Search filter berfungsi (nama, email, ticket code)
- [ ] Tabel attendees menampilkan data lengkap
- [ ] Export CSV berfungsi
- [ ] Error handling untuk event tidak ditemukan

### 3. Test Scenarios

#### Scenario 1: Happy Path
1. Login sebagai event organizer
2. Navigate ke `/organizer/attendees`
3. Pilih event yang memiliki attendees
4. Verify data statistics benar
5. Test filter status
6. Test search functionality
7. Export CSV dan verify content

#### Scenario 2: Error Handling
1. Navigate ke `/organizer/events/invalid-slug/attendees`
2. Verify error message "Event tidak ditemukan"
3. Test dengan eventId yang tidak memiliki attendees
4. Verify empty state message

#### Scenario 3: Loading States
1. Monitor loading states saat navigasi
2. Verify skeleton loading benar
3. Test dengan network throttling

## Expected Results

### Backend
- ✅ Query SQL berhasil dijalankan
- ✅ Status normalization berfungsi (UPPERCASE → lowercase)
- ✅ Response format konsisten dengan `{success: true, data: [], total: number}`
- ✅ CSV export dengan BOM encoding untuk Excel

### Frontend
- ✅ Data attendees ditampilkan dengan benar
- ✅ Statistics cards menampilkan angka yang akurat
- ✅ Filter dan search berfungsi real-time
- ✅ Error states ditampilkan dengan baik
- ✅ Loading states smooth

## Troubleshooting

### Query Returns Empty
- Check eventId is valid UUID
- Check event has attendees with tickets
- Check status filter casing (should be normalized in backend)

### CSV Export Issues
- Check file download permissions
- Verify CSV encoding (should include BOM for Excel)
- Check filename format includes date

### Performance Issues
- Enable query caching in React Query (already configured)
- Monitor SQL query performance in backend logs
- Consider pagination for large datasets

## Data Structure Expected

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+628123456789",
      "ticket": {
        "ticketCode": "TKT-ABC123",
        "status": "unused",
        "category": {
          "name": "Regular"
        }
      }
    }
  ],
  "total": 1
}
```
