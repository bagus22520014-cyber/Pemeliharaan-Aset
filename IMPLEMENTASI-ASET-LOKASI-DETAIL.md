# Implementasi Aset Lokasi di Detail View

## Overview

Menambahkan fitur untuk menampilkan dan mengedit distribusi lokasi aset dari tabel `aset_lokasi` pada halaman detail aset. User dapat melihat lokasi distribusi yang sudah ada dan melakukan CRUD operations langsung dari detail view.

## Perubahan File

### 1. useAssetDetail.js

**Lokasi**: `src/components/tabelAset/tabel/detail/useAssetDetail.js`

**Perubahan**:

- ✅ Import `getAsetLokasiByAsetId` dari `@/api/aset-lokasi`
- ✅ Tambah state `distribusiLokasi` dan `setDistribusiLokasi`
- ✅ Tambah useEffect untuk fetch distribusi lokasi berdasarkan AsetId
- ✅ Return `distribusiLokasi` dan `setDistribusiLokasi` dari hook

**Code**:

```javascript
// Import
import { getAsetLokasiByAsetId } from "@/api/aset-lokasi";

// State
const [distribusiLokasi, setDistribusiLokasi] = useState(null);

// useEffect untuk fetch
useEffect(() => {
  let cancelled = false;
  async function loadDistribusiLokasi() {
    setDistribusiLokasi(null);
    if (!asset) return;
    const asetId = asset.asetId || asset.id;
    if (!asetId) return;
    try {
      const data = await getAsetLokasiByAsetId(asetId);
      if (!cancelled) {
        setDistribusiLokasi(data);
      }
    } catch (err) {
      if (!cancelled) setDistribusiLokasi(null);
    }
  }
  loadDistribusiLokasi();
  return () => {
    cancelled = true;
  };
}, [asset]);
```

### 2. AssetDetail.jsx

**Lokasi**: `src/components/tabelAset/tabel/detail/AssetDetail.jsx`

**Perubahan**:

- ✅ Destructure `distribusiLokasi` dan `setDistribusiLokasi` dari `useAssetDetail`
- ✅ Pass `distribusiLokasi` dan `onDistribusiChange={setDistribusiLokasi}` ke `AssetFormLayout`

**Code**:

```jsx
const {
  // ...existing destructure
  distribusiLokasi,
  setDistribusiLokasi,
  // ...
} = useAssetDetail({ asset, onUpdated });

// Di JSX
<AssetFormLayout
  // ...existing props
  distribusiLokasi={distribusiLokasi}
  onDistribusiChange={setDistribusiLokasi}
  // ...
/>;
```

### 3. AssetFormLayout.jsx

**Lokasi**: `src/components/tabelAset/FormLayout/AssetFormLayout.jsx`

**Perubahan**:

- ✅ Tambah props `distribusiLokasi` dan `onDistribusiChange`
- ✅ Pass props tersebut ke `FormFields`

**Code**:

```jsx
export default function AssetFormLayout({
  // ...existing props
  distribusiLokasi = null,
  onDistribusiChange = null,
}) {
  // ...

  <FormFields
    // ...existing props
    distribusiLokasi={distribusiLokasi}
    onDistribusiChange={onDistribusiChange}
  />;
}
```

### 4. FormFields.jsx

**Lokasi**: `src/components/tabelAset/FormLayout/FormFields.jsx`

**Perubahan**:

- ✅ Tambah props `distribusiLokasi` dan `onDistribusiChange`
- ✅ Update `DistribusiLokasiInput` untuk menggunakan data dari `distribusiLokasi` (fetched dari API) saat view mode
- ✅ Update onChange handler untuk sync dengan backend saat view mode
- ✅ Set `isViewMode={false}` agar selalu editable
- ✅ Pass `asetId` ke `DistribusiLokasiInput` untuk CRUD operations

**Code**:

```jsx
export default function FormFields({
  // ...existing props
  distribusiLokasi = null,
  onDistribusiChange = null,
}) {
  // ...

  <DistribusiLokasiInput
    distribusiLokasi={
      isViewMode
        ? distribusiLokasi?.locations ||
          displayData?.distribusi_lokasi?.locations ||
          []
        : form?.distribusi_lokasi || []
    }
    onChange={(newDistribusi) => {
      if (isViewMode && onDistribusiChange) {
        // Update fetched state + recalculate totals
        onDistribusiChange({
          ...distribusiLokasi,
          locations: newDistribusi,
          total_allocated: newDistribusi.reduce(
            (sum, loc) => sum + (parseInt(loc.jumlah) || 0),
            0
          ),
          available:
            (displayData?.jumlah || 0) -
            newDistribusi.reduce(
              (sum, loc) => sum + (parseInt(loc.jumlah) || 0),
              0
            ),
        });
      } else {
        // Update form state
        setForm({ ...form, distribusi_lokasi: newDistribusi });
      }
    }}
    totalJumlah={
      isViewMode ? displayData?.jumlah || 0 : parseInt(form?.jumlah) || 0
    }
    isViewMode={false}
    asetId={isViewMode ? displayData?.asetId || displayData?.id : null}
  />;
}
```

### 5. DistribusiLokasiInput.jsx

**Lokasi**: `src/components/tabelAset/FormLayout/DistribusiLokasiInput.jsx`

**Perubahan**:

- ✅ Import API functions: `createAsetLokasi`, `updateAsetLokasi`, `deleteAsetLokasi`
- ✅ Import `FaSave` icon
- ✅ Tambah prop `asetId`
- ✅ Tambah state: `saving`, `saveError`, `editedIndexes`
- ✅ Update `handleAdd`: Auto-save ke backend jika `asetId` ada
- ✅ Update `handleRemove`: Auto-delete dari backend jika item memiliki `id`
- ✅ Update `handleUpdate`: Track edited items
- ✅ Tambah `handleSaveEdits`: Save semua edited items ke backend
- ✅ Tambah "Simpan Perubahan" button di header (muncul saat ada edits)
- ✅ Tambah loading state dan error handling

**Code**:

```jsx
import {
  createAsetLokasi,
  updateAsetLokasi,
  deleteAsetLokasi,
} from "@/api/aset-lokasi";
import { FaSave } from "react-icons/fa";

export default function DistribusiLokasiInput({
  distribusiLokasi = [],
  onChange,
  totalJumlah = 0,
  isViewMode = false,
  asetId = null, // NEW PROP
}) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [editedIndexes, setEditedIndexes] = useState(new Set());

  // handleAdd, handleRemove, handleUpdate, handleSaveEdits
  // dengan logic untuk save ke backend jika asetId ada
}
```

**UI Changes**:

- Button "Simpan Perubahan" muncul di header saat ada edited items
- Disable buttons saat `saving={true}`
- Show error message jika ada error
- Loading text "Menyimpan..." pada tombol saat saving

## Flow Data

### 1. Saat Detail View Dibuka

```
AssetDetail → useAssetDetail (fetch aset_lokasi) → distribusiLokasi state
                     ↓
              AssetFormLayout
                     ↓
               FormFields
                     ↓
          DistribusiLokasiInput (display data)
```

### 2. Saat User Edit Lokasi

```
User mengetik → handleUpdate → track ke editedIndexes → muncul button "Simpan"
```

### 3. Saat User Klik "Simpan Perubahan"

```
handleSaveEdits → updateAsetLokasi API (for each edited item) → clear editedIndexes
```

### 4. Saat User Tambah Lokasi Baru

```
handleAdd → createAsetLokasi API → update distribusiLokasi → refresh UI
```

### 5. Saat User Hapus Lokasi

```
handleRemove → deleteAsetLokasi API → update distribusiLokasi → refresh UI
```

## Backend Requirements

API endpoints yang digunakan:

- ✅ `GET /aset-lokasi?AsetId={asetId}` - Fetch distribusi lokasi
- ✅ `POST /aset-lokasi` - Create lokasi baru
- ✅ `PUT /aset-lokasi/{id}` - Update lokasi existing
- ✅ `DELETE /aset-lokasi/{id}` - Delete lokasi

Payload structure:

```javascript
// Create/Update
{
  AsetId: "0001/MLG-NET/2024",
  Lokasi: "Ruang Server - Lantai 2",
  Jumlah: 5,
  Keterangan: "Untuk testing"
}
```

Response structure:

```javascript
{
  total_allocated: 10,
  available: 5,
  locations: [
    {
      id: 1,
      lokasi: "Ruang Server",
      jumlah: 5,
      keterangan: "..."
    }
  ]
}
```

## Testing Steps

1. **Buka Detail Aset**:

   - Cek apakah distribusi lokasi muncul
   - Verifikasi data sesuai dengan backend

2. **Edit Lokasi Existing**:

   - Ubah nama lokasi/jumlah/keterangan
   - Cek apakah button "Simpan Perubahan" muncul
   - Klik "Simpan Perubahan"
   - Verifikasi data tersimpan ke backend

3. **Tambah Lokasi Baru**:

   - Klik "Tambah Lokasi Distribusi"
   - Isi form dan klik "Tambah"
   - Verifikasi auto-save ke backend
   - Cek apakah UI terupdate

4. **Hapus Lokasi**:

   - Klik icon trash
   - Verifikasi data terhapus dari backend
   - Cek apakah UI terupdate

5. **Validasi Total**:
   - Cek apakah total allocated dihitung dengan benar
   - Cek apakah available = totalJumlah - total_allocated
   - Cek warning muncul jika over-allocated

## Features

✅ **Auto-fetch**: Distribusi lokasi diambil otomatis saat detail dibuka
✅ **Real-time CRUD**: Tambah, edit, hapus langsung ke backend
✅ **Batch Edit**: User bisa edit multiple items, lalu save sekaligus
✅ **Validation**: Cek total alokasi tidak melebihi jumlah aset
✅ **Loading State**: Show loading saat save/delete
✅ **Error Handling**: Display error message jika API gagal
✅ **Visual Feedback**: Button "Simpan Perubahan" muncul saat ada edits

## Notes

- Komponen selalu dalam mode "editable" bahkan di view mode (set `isViewMode={false}`)
- Data diambil dari `distribusiLokasi` state (hasil fetch dari API), bukan dari `displayData.distribusi_lokasi`
- CRUD operations hanya dilakukan jika `asetId` ada (di detail view)
- Saat create asset, tidak ada `asetId`, jadi CRUD tidak dilakukan (data hanya di local state)
