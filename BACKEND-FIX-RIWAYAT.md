# Backend Fix - Riwayat Duplikat & Status Update

## Masalah Saat Ini

Ketika user melakukan aksi (perbaikan/rusak/dipinjam/dijual), muncul **2 riwayat**:

1. Riwayat aksi itu sendiri (misal: `perbaikan_input`)
2. Riwayat edit status aset (misal: `edit` dengan perubahan `StatusAset`)

## Solusi yang Diperlukan di Backend

### 1. Auto-Update StatusAset

Saat endpoint `/perbaikan`, `/rusak`, `/dipinjam`, `/dijual` dipanggil, backend harus:

**A. Update StatusAset di tabel `aset` secara langsung:**

```javascript
// Di endpoint POST /perbaikan
async function createPerbaikan(req, res) {
  // ... insert ke tabel perbaikan ...

  // Update status aset tanpa trigger riwayat
  await db.query("UPDATE aset SET StatusAset = ? WHERE AsetId = ?", [
    "diperbaiki",
    asetId,
  ]);

  // Catat riwayat HANYA untuk aksi perbaikan (bukan edit)
  await logRiwayat({
    jenis_aksi: "perbaikan_input",
    aset_id: asetDbId,
    tabel_ref: "perbaikan",
    record_id: perbaikanId,
    // JANGAN catat perubahan StatusAset
  });
}
```

**B. Mapping Status:**

| Aksi              | StatusAset Baru |
| ----------------- | --------------- |
| POST `/perbaikan` | `diperbaiki`    |
| POST `/rusak`     | `rusak`         |
| POST `/dipinjam`  | `dipinjam`      |
| POST `/dijual`    | `dijual`        |

### 2. Prevent Double Riwayat

Pastikan fungsi `logRiwayat()` atau trigger database **tidak mencatat perubahan StatusAset** ketika perubahan tersebut berasal dari aksi perbaikan/rusak/dipinjam/dijual.

**Opsi A: Skip jika hanya StatusAset yang berubah**

```javascript
// Di fungsi updateAset atau trigger
function shouldLogRiwayat(changes) {
  // Jika hanya StatusAset yang berubah, skip log riwayat
  const changedFields = Object.keys(changes);
  if (changedFields.length === 1 && changedFields[0] === "StatusAset") {
    return false; // Jangan log
  }
  return true;
}
```

**Opsi B: Flag khusus untuk skip riwayat**

```javascript
// Di endpoint perbaikan/rusak/dipinjam/dijual
await updateAsetStatus(asetId, newStatus, { skipRiwayat: true });

function updateAsetStatus(asetId, status, options = {}) {
  // Update status tanpa trigger riwayat
  if (!options.skipRiwayat) {
    // log riwayat normal
  }
}
```

### 3. Struktur Riwayat yang Benar

Setelah fix, riwayat harus seperti ini:

**Sebelum (Ada Duplikat):**

```
[2025-12-07 14:30:00] perbaikan_input - tabel_ref: perbaikan, record_id: 1
[2025-12-07 14:30:01] edit - perubahan: StatusAset (aktif → diperbaiki)
```

**Sesudah (Hanya 1 Riwayat):**

```
[2025-12-07 14:30:00] perbaikan_input - tabel_ref: perbaikan, record_id: 1
```

Dan status aset otomatis berubah menjadi `diperbaiki` tanpa riwayat edit tambahan.

## Frontend Changes (Sudah Diterapkan)

Frontend sudah diupdate untuk:

- ✅ **Tidak** memanggil `updateAset()` secara terpisah setelah perbaikan/rusak/dipinjam/dijual
- ✅ Hanya memanggil endpoint aksi dan mengandalkan backend untuk update status
- ✅ Menampilkan badge StatusAset di timeline riwayat
- ✅ Menampilkan detail lengkap (jumlah, catatan, dll) di RecordDetail

## Testing

Setelah backend fix, test dengan:

```bash
# 1. Tambah perbaikan
curl -X POST -b cookies.txt -H "Content-Type: application/json" \
  -d '{"AsetId":"TEST/001","tanggal_perbaikan":"2025-12-07","deskripsi":"Test perbaikan"}' \
  http://localhost:4000/perbaikan

# 2. Cek riwayat - seharusnya hanya 1 entry
curl -b cookies.txt http://localhost:4000/riwayat?aset_id=TEST/001

# 3. Cek status aset - seharusnya "diperbaiki"
curl -b cookies.txt http://localhost:4000/aset/TEST%2F001
```

Expected result:

- 1 riwayat dengan jenis_aksi: `perbaikan_input`
- StatusAset di tabel aset: `diperbaiki`
- Tidak ada riwayat dengan jenis_aksi: `edit`
