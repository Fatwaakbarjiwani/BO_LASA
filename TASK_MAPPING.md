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
