# MOM Training Mobile Apps LAZIS - Task Mapping

**Project Manager:** Anda  
**Staff:** Bagus  
**Date:** 30 September 2026

---

## Tabel Mapping Menu - Tugas - Assigned To

| # | Menu | Task | Assigned To | Status | Catatan |
|---|------|------|-------------|--------|---------|
| 1 | Input Jurnal - Campaign | Tambah input jurnal untuk campaign pada web BO, dibuat menu sendiri atau terpisah | Bagus | ✅ DONE | Sudah selesai |
| 2 | Input Jurnal - Pencarian | Tambah fitur cari di field "masuk ke rekening" di input jurnal | **Bagus** | - | Backend filter, relatable ke nomor rekening |
| 3 | Input Jurnal - Edit & View | Tambah fitur edit di input jurnal + view table data yang sudah diinput | **Bagus** | - | Core feature, UI + endpoint |
| 4 | Input Jurnal - Jurnal Akunting | Tambah rumus zakat dan wakaf (12.5% dan 20%) di input penerimaan + auto journal entries ke COA | **Bagus** | - | Complex: logic + multi-journal entries |
| 5 | Input Jurnal - Jurnal Akunting | Edit Jurnal | **Bagus** | - | Related ke #3 |
| 6 | Input Jurnal - Upload | Upload data jurnal (data September dari HOA HOE) | **Bagus** | - | Data migration |
| 7 | Saldo Awal | Saldo awal dibuat hanya 1 inputan untuk mengatur saldo awal | **Anda** | - | Config/Setup feature |
| 8 | Administrasi - Rekening Bank | Tambah download per rekening bank (filter di daftar jurnal) | **Anda** | - | Report feature, admin access |
| 9 | Administrasi - Penerimaan | Buat rekening penerimaan baru tapi tidak masuk ke laporan mobile | **Anda** | - | Master data setup |
| 10 | Administrasi - COA | Pencarian daftar akun (Search Account List) | **Anda** | - | Utility feature untuk admin |
| 11 | Administrasi - Mauquf Alaih | Master mauquf alaih dipindah dari administrasi ke menu wakaf | **Anda** | - | Menu reorganization |
| 12 | Administrasi - Mauquf Alaih | Tambahkan import mauquf alaih atau bantu insert data ke sistem BO | **Anda** | - | Data import feature |
| 13 | Administrasi - Sumber Kas | Sumber kas dibuat dinamis + tambah rekening bank untuk sumber kas wakaf | **Anda** | - | Dynamic configuration |
| 14 | Penyaluran Mauquf Alaih | Tambah sub kategori living cost di penyaluran mauquf alaih + dukungan perubahan dinamis | **Bagus** | - | Frontend + backend dynamic fields |
| 15 | Penerimaan Wakaf | Penerimaan harta wakaf - sistem tau jangka waktu untuk beberapa periode (non-permanen) | **Bagus** | - | Logic: handle temporary vs permanent waqf |
| 16 | Wakaf - Master Data | Tambah export daftar harta wakaf | **Anda** | - | Report export feature |
| 17 | Laporan - Balance Sheet | Transaksi sudah masuk di mobile apps, namun di neraca belum merubah | **Anda** | - | Backend calculation fix |
| 18 | Laporan - Balance Sheet Mobile | Laporan neraca di mobile ditambahkan tgl transaksi | **Anda** | - | UI enhancement |
| 19 | Input Jurnal - Mustahik vs Mauquf | Mustahik tidak perlu input daftar (langsung di jurnal), sedangkan mauquf ada datanya | **Bagus** | - | UI logic: conditional input method |

---

## Ringkasan Distribusi Tugas

### Bagus (Frontend/Input Features) - 7 Tugas
- ✅ Input Jurnal Campaign
- Pencarian di Input Jurnal (#2)
- Edit & View Table Input Jurnal (#3)
- Rumus Zakat & Wakaf + Auto Journal (#4)
- Edit Jurnal (#5)
- Upload Data Jurnal (#6)
- Penyaluran Mauquf Alaih Dynamic (#14)
- Penerimaan Wakaf (Multi-period logic) (#15)
- Mustahik vs Mauquf conditional input (#19)

### Anda (Admin/Config/Reports) - 8 Tugas
- Saldo Awal Setup (#7)
- Download per Rekening Bank (#8)
- Rekening Penerimaan Baru (#9)
- Pencarian Akun (#10)
- Reorganisasi Menu Mauquf (#11)
- Import Mauquf Alaih (#12)
- Sumber Kas Dinamis (#13)
- Export Wakaf & Balance Sheet Fixes (#16, #17, #18)

---

## Catatan Implementasi Teknis

### Priority High (Blocking Features)
1. **Input Jurnal + Rumus Zakat/Wakaf** - Backbone sistem akunting
2. **Edit Jurnal** - Core feature yang dependent pada #1
3. **Balance Sheet Calculation** - Laporan yang sudah di mobile harus benar

### Priority Medium (Enhancement)
4. Pencarian & Filter di Jurnal
5. Dynamic fields (Sumber Kas, Penyaluran)
6. Master data upload/import

### Priority Low (Polish)
7. Export features
8. UI enhancements (date field additions)

---

## Identifikasi Source Code Areas untuk Meminimalkan Conflict

### Frontend (Bagus)
```
src/pages/JournalInput.tsx
src/components/JournalForm.tsx
src/components/ZakatWaqfCalculator.tsx
src/pages/MauqufAlaihDistribution.tsx
```

### Backend API (Anda - Admin/Config)
```
routes/admin/accounts.ts
routes/admin/master-data.ts
routes/reports/balance-sheet.ts
routes/config/cash-source.ts
```

### Share carefully
```
types/journal.ts
utils/calculations.ts
hooks/useJournalData.ts
```

---

## Next Steps
1. Confirm tugas masing-masing dengan Bagus
2. Set up branch strategy: `feature/bagus-journal` & `feature/admin-config`
3. Review dependencies antara tugas sebelum mulai
4. Daily sync untuk handle blocking issues

---

## Revisi Tambahan (2 Oktober 2026) — Pembagian untuk Meminimalkan Conflict

**Prinsip:** satu file utama dipegang satu orang. Lima catatan yang berulang di keempat tab Input Jurnal
(periode, cetak/Excel, klik no. bukti, pagination, batal jurnal) semuanya ada di **satu komponen tabel yang sama**
(`RiwayatInput` di `InputJurnal.jsx`), jadi dikerjakan **sekali** dan otomatis berlaku untuk Penerimaan, Penyaluran,
Beban Operasional, dan Transfer Antar Dana.

### Tabel Mapping

| # | Menu | Task | Assigned To | File yang disentuh |
|---|------|------|-------------|--------------------|
| R1 | Input Jurnal - Penerimaan & Penyaluran | Dropdown jenis campaign bisa dicari (pakai `SearchSelect`) | **Bagus** | BO: `keuangan/InputJurnal.jsx` (FormPenerimaan, FormPenyaluran) |
| R2 | Input Jurnal - semua tab | Periode tanggal dinamis (tgl awal & tgl akhir) di tabel data | **Bagus** | BO: `InputJurnal.jsx` (RiwayatInput) · BE: `KeuanganController.jurnal()` tambah param `from`, `to` |
| R3 | Input Jurnal - semua tab | Pagination tabel data | **Bagus** | BO: `InputJurnal.jsx` (RiwayatInput) · BE: `KeuanganController.jurnal()` tambah `page`, `size` + total data |
| R4 | Input Jurnal - semua tab | Klik no. bukti → tampil akun, debet, kredit | **Bagus** | BO: `InputJurnal.jsx` (modal detail; endpoint `GET /keuangan/jurnal/{id}` sudah ada) |
| R5 | Input Jurnal - semua tab | Fitur batal jurnal (dengan alasan) | **Bagus** | BO: `InputJurnal.jsx` (endpoint `POST /keuangan/jurnal/{id}/void` sudah ada) |
| R6 | Input Jurnal - semua tab | Cetak jurnal (PDF) per jurnal & per periode | **Shafwan** | BO: file baru `keuangan/cetakJurnal.js` (pakai `jspdf` yang sudah terpasang) |
| R7 | Input Jurnal - semua tab | Download Excel per jurnal & per periode | **Shafwan** | BE: controller baru `posting/JurnalExportController.java` (pakai Apache POI yang sudah ada di pom) |
| R8 | Input Jurnal - semua tab | Pasang tombol Cetak & Excel di tabel data | **Bagus** | BO: `InputJurnal.jsx` — memanggil hasil R6 & R7, dikerjakan setelah keduanya di-push |
| R9 | Saldo Awal | Tambah bulan dan tahun | **Shafwan** | BO: `saldoAwal/SaldoAwal.jsx` · BE: `SaldoAwalService`, `SaldoAwalRequest` (+ migrasi bila perlu) |
| R10 | Rekening & Harian | Dalami fungsi & output (analisis dulu, tulis usulan sebelum ubah kode) | **Shafwan** | BO: `keuangan/RekeningPage.jsx` · BE: `HarianService` |
| R11 | Administrasi | Hapus menu Mustahik dari Administrasi | **Shafwan** | BO: `administrasi/Administrasi.jsx` saja |

### Aturan file bersama

| File | Aturan |
|------|--------|
| `InputJurnal.jsx` | Hanya Bagus. Shafwan tidak mengubah file ini; hasil R6/R7 dipasang Bagus (R8). |
| `Administrasi.jsx`, `SaldoAwal.jsx`, `RekeningPage.jsx` | Hanya Shafwan. |
| `KeuanganController.java` (BE) | Bagus hanya mengubah method `jurnal()` (daftar jurnal). Fitur export Shafwan ditaruh di controller baru, tidak di file ini. |
| `keuanganApi.js` | Keduanya boleh menambah fungsi, tetapi hanya **menambah baris baru** di kelompok masing-masing: Bagus di bawah `voidJurnal`, Shafwan di bagian paling akhir. Jangan mengubah/merapikan baris yang sudah ada. |
| `ui.jsx` (`SearchSelect`, `Btn`, dll.) | Jangan diubah. Kalau perlu komponen baru, bicarakan dulu siapa yang menambahkan. |
| `package.json`, `pom.xml` | Tidak perlu diubah (`jspdf` dan Apache POI sudah ada). Kalau ternyata butuh library baru, satu orang saja yang menambahkan. |
| Migrasi database | Nomor terakhir **V26**. Bagus memakai **V27**, Shafwan **V28** (dan seterusnya bergantian) supaya tidak bentrok nomor seperti V24 kemarin. |

### Kesepakatan sebelum mulai (supaya R6–R8 tidak saling tunggu)

1. **Parameter filter daftar jurnal** dipakai bersama oleh tabel (R2/R3) dan export (R6/R7):
   `jenis`, `from`, `to` (format `yyyy-MM-dd`), `q`, `status`. Bagus push perubahan `KeuanganController.jurnal()` lebih dulu.
2. **Kontrak R6 (cetak):** `cetakJurnal(daftarDetail, { judul, periode })` — `daftarDetail` = array hasil `GET /keuangan/jurnal/{id}`.
3. **Kontrak R7 (Excel):** `GET /api/keuangan/jurnal/{id}/excel` (per jurnal) dan `GET /api/keuangan/jurnal/excel?jenis&from&to&q&status` (per periode), mengembalikan file `.xlsx`.

### Urutan kerja yang disarankan

| Tahap | Bagus | Shafwan |
|-------|-------|---------|
| 1 | R2 + R3 backend (param filter & pagination) → push | R9, R11 |
| 2 | R1, R4, R5 | R6, R7 (pakai param filter dari tahap 1) → push |
| 3 | R8 (pasang tombol Cetak & Excel) | R10 (analisis Rekening & Harian) |

Kebiasaan kerja: `git pull` sebelum mulai, commit kecil-kecil, push di akhir tiap task. Jangan `git stash` lama-lama.

### Perlu dikonfirmasi

- Baris catatan **"Input Jurnal - Penyaluran → Input Jurnal - Penyaluran"** kolom catatannya sama dengan nama menu (kemungkinan salah salin). Isi sebenarnya apa?
- **Beban Operasional** tidak tercantum "batal jurnal" di catatan, tetapi karena tabelnya satu komponen, fitur batal ikut muncul juga di tab ini. Apakah memang boleh?
- **R11 (hapus menu Mustahik)** berkaitan dengan task lama #19: form Penyaluran masih memakai daftar mustahik terdaftar. Yang dihapus hanya menunya, atau data mustahik juga tidak dipakai lagi di Penyaluran?
