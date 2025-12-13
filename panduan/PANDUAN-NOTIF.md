# Panduan Notifikasi — Pemeliharaan Aset

Panduan ini menjelaskan secara lengkap mekanisme notifikasi server, struktur data notifikasi, titik-titik pembuatan notifikasi dalam kode, cara verifikasi, contoh skrip untuk pengujian, serta langkah-langkah troubleshooting untuk masalah umum.

Tujuan: membantu developer dan operator (admin) memahami alur pembuatan dan konsumsi notifikasi, serta memberi contoh praktis untuk debugging dan automated testing.

## Ringkasan singkat

- Notifikasi dihasilkan oleh server pada beberapa momen kunci: request pengajuan (user), keputusan approval (admin), dan — opsional — saat perubahan disetujui dan diterapkan (mis. `apply_mutasi`, `apply_dijual`).
- Notifikasi disimpan di tabel `notification` dan dapat diambil melalui endpoint API.
- Notifikasi mencakup metadata penting untuk menautkan ke resource: `tabel_ref`, `record_id`, dan `AsetId`.

## Lokasi kode relevan

- Pembuatan/dispatch notifikasi utama: [routes/middleware/approval.js](routes/middleware/approval.js#L1) — `notifySubmitterOfDecision`, `notifyAdminsForApproval`, dan helper terkait.
- API endpoint untuk notifikasi: [routes/notification.js](routes/notification.js#L1).
- Tempat pembuatan notifikasi tambahan (opsional): `routes/approval.js` saat menerapkan perubahan (apply actions).

Catatan: file/line links above point to the typical helpers; search kode untuk `createNotification`, `insert into notification`, atau `notifySubmitterOfDecision` bila ada versi lokal berbeda.

## Skema dan kolom penting

Kolom-notifikasi yang sering digunakan (ringkas):

- `id` (INT)
- `user_id` (INT) — penerima notifikasi (nullable jika notifikasi bersifat global)
- `beban` (VARCHAR) — kode unit/tenant yang relevan
- `tipe` (VARCHAR) — `success` / `error` / `approval` / `info` (dipakai untuk UI badge)
- `judul` (VARCHAR)
- `pesan` (TEXT)
- `link` (VARCHAR|null) — URL atau route di UI
- `tabel_ref` (VARCHAR) — contoh: `mutasi`, `perbaikan`, `dijual`
- `record_id` (INT) — id baris pada tabel referensi
- `AsetId` (VARCHAR) — human-readable AsetId (string seperti `0003/MLG-MEDIA/2025`)
- `approver_user_id`, `approver_username`, `approver_role` — metadata tentang admin yang memberi keputusan
- `dibaca` (BOOLEAN / TINYINT) — flag sudah dibaca
- `created_at`, `updated_at` — timestamp

Tip: jika `user_id` null, notifikasi dapat dianggap broadcast; UI/consumer harus mengfilter berdasarkan `beban` dan peran.

## Kapan server membuat notifikasi

- Saat user mengajukan (non-admin): `notifyAdminsForApproval()` membuat notifikasi bertipe `approval` untuk admin.
- Saat admin menyetujui atau menolak: `notifySubmitterOfDecision()` membuat notifikasi untuk submitter bertipe `success` (approve) atau `error` (reject), menyertakan `approver_*` metadata.
- Opsional: setelah approval menerapkan perubahan (mis. `apply_mutasi`, `apply_dijual`), tambahkan notifikasi `success` bertajuk `Mutasi Diterapkan` atau `Penjualan Selesai` agar submitter tahu perubahan diterapkan ke aset.

## Contoh payload notifikasi (JSON)

{
"user_id": 54,
"beban": "MLG-MEDIA",
"tipe": "success",
"judul": "Pengajuan Disetujui",
"pesan": "Pengajuan mutasi untuk aset 0003/MLG-MEDIA/2025 telah disetujui oleh admin.",
"link": "/mutasi/53",
"tabel_ref": "mutasi",
"record_id": 53,
"AsetId": "0003/MLG-MEDIA/2025",
"approver_user_id": 1,
"approver_username": "admin",
"approver_role": "admin"
}

## Endpoint API & contoh penggunaan

- Ambil notifikasi (user):

```bash
curl -H "x-username: user1" -H "x-role: user" -H "x-beban: MLG-MEDIA" \
  http://localhost:4000/notification
```

- Ambil count unread:

```bash
curl -H "x-username: user1" -H "x-role: user" -H "x-beban: MLG-MEDIA" \
  http://localhost:4000/notification/unread-count
```

- Tandai notifikasi sebagai dibaca (single):

```bash
curl -X PUT -H "x-username: user1" -H "x-role: user" -H "x-beban: MLG-MEDIA" \
  http://localhost:4000/notification/123/read
```

- Tandai semua sebagai dibaca:

```bash
curl -X PUT -H "x-username: user1" -H "x-role: user" -H "x-beban: MLG-MEDIA" \
  http://localhost:4000/notification/read-all
```

## Contoh alur — approval mutasi

1. User membuat `mutasi` (non-admin). Server menulis riwayat `mutasi_input` dan memanggil `notifyAdminsForApproval()`.
2. Admin menerima notifikasi `approval` di UI (atau via GET /notification) dan memilih `approve`.
3. Server pada `POST /approval/mutasi/:id/approve`:
   - Memanggil `updateApprovalStatus()` untuk menyimpan approval metadata.
   - Menerapkan perubahan aset (update `aset.departemen_id`, `aset.Lokasi`) — ditempatkan di `routes/approval.js`.
   - Menulis riwayat `apply_mutasi` dengan `perubahan: { from: {...}, to: {...} }`.
   - Memanggil `notifySubmitterOfDecision()` agar submitter menerima notifikasi `success`.

Contoh notifikasi yang dibuat saat approval:

- Approve (success):

```
judul: "Pengajuan Disetujui"
pesan: "Pengajuan mutasi untuk aset 0003/MLG-MEDIA/2025 telah disetujui oleh admin"
tipe: success
tabel_ref: mutasi
record_id: 53
approver_username: admin
```

- Reject (error):

```
judul: "Pengajuan Ditolak"
pesan: "Pengajuan perbaikan untuk aset 0002/MLG-MEDIA/2025 telah ditolak oleh admin. Alasan: <alasan>"
tipe: error
```

## Contoh skrip pengujian (Node.js)

Simpan sebagai `scripts/send-test-notif.js` (dev only):

```javascript
// scripts/send-test-notif.js
import fetch from "node-fetch";

const base = "http://localhost:4000";

async function sendTest() {
  const payload = {
    user_id: 54,
    beban: "MLG-MEDIA",
    tipe: "info",
    judul: "Test Notif",
    pesan: "Ini notifikasi test dari scripts/send-test-notif.js",
    tabel_ref: null,
    record_id: null,
    AsetId: null,
  };

  const res = await fetch(`${base}/notification/test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-username": "admin",
      "x-role": "admin",
    },
    body: JSON.stringify(payload),
  });
  console.log("status", res.status);
  console.log(await res.json());
}

sendTest().catch(console.error);
```

Catatan: endpoint `/notification/test` mungkin tidak ada; jika tidak tersedia, gunakan `POST /notification` atau buat helper endpoint sementara di dev yang memanggil helper notifikasi.

## Contoh PowerShell untuk pengujian cepat

```powershell
$headers = @{
  'x-username' = 'admin'
  'x-role' = 'admin'
}
$body = @{ user_id=54; beban='MLG-MEDIA'; tipe='info'; judul='Test Notif PS'; pesan='Tes' } | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:4000/notification -Method Post -Body $body -Headers $headers -ContentType 'application/json'
```

## Debugging & troubleshooting

- Jika submitter tidak menerima notifikasi:
  1. Periksa apakah `notifySubmitterOfDecision()` dieksekusi — lihat logs pada approval handler.
  2. Periksa apakah `user_id` yang dicari ada di `riwayat` (approval flow mencari submitter di riwayat input). Contoh SQL untuk menemukan submitter:

```sql
SELECT user_id, perubahan
FROM riwayat
WHERE tabel_ref = 'mutasi' AND record_id = 53 AND jenis_aksi LIKE '%mutasi_input%';
```

3. Pastikan header `x-beban` dan `x-username` dipakai saat memanggil GET /notification untuk melihat notifikasi yang sesuai dengan beban user.
4. Cek insert ke `notification` gagal karena constraint (mis. foreign key `user_id`) — periksa server console error dan MySQL error log.

- Query cepat untuk melihat notifikasi recent untuk user tertentu:

```sql
SELECT * FROM notification
WHERE user_id = 54
ORDER BY created_at DESC
LIMIT 50;
```

- Jika `approver_*` kosong dalam payload: pastikan approval flow meneruskan `adminUser`/`approver` info ketika memanggil `notifySubmitterOfDecision()`.

## Best practices

- Selalu isi `tabel_ref`, `record_id` dan `AsetId` saat membuat notifikasi agar UI dapat menautkan langsung ke resource.
- Gunakan `tipe` konsisten (`success`/`error`/`approval`/`info`) agar frontend dapat memetakan warna/ikon.
- Untuk perubahan yang memiliki dua tahap (approve -> apply), kirim dua notifikasi: satu `success` untuk keputusan, satu `info`/`success` setelah `apply_*` selesai.
- Jangan mengandalkan `user_id` saja untuk broadcast notifikasi — gunakan `beban` + role filter untuk menargetkan admin/operator.

## Langkah lanjutan (opsional implementasi)

- Tambahkan notifikasi `apply_mutasi` dan `apply_dijual` di `routes/approval.js` setelah perubahan aset berhasil diterapkan.
- Buat `scripts/send-test-notif.js` atau `scripts/send-test-notif.ps1` untuk automation di lingkungan dev.

---

File ini disimpan sebagai [PANDUAN-NOTIF.md](PANDUAN-NOTIF.md). Ingin saya juga menambahkan contoh endpoint dev `POST /notification/test` dan `scripts/send-test-notif.js` file ke repo?
