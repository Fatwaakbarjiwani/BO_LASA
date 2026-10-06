/**
 * Isi bawaan Panduan (Manual Book) Administrasi Keuangan. Ditampilkan selama belum ada versi yang disimpan dari BO
 * (tabel panduan_bagian kosong) dan dipakai oleh tombol "Kembalikan ke bawaan".
 *
 * Format penulisan (sama dengan editor di BO):
 *   ## Subjudul        - daftar butir        1. daftar bernomor
 *   > catatan penting  | tabel | kolom |     **tebal**   `kode/tombol`
 */
export const PANDUAN_BAWAAN = [
  {
    judul: "1. Pendahuluan & Alur Besar",
    isi: `Menu **Administrasi Keuangan** adalah tempat seluruh pencatatan keuangan LAZIS Sultan Agung: mulai dari data master (akun & rekening), input transaksi harian, pemeriksaan, tutup buku, sampai laporan keuangan. Semua laporan dihitung otomatis dari **jurnal berstatus POSTED** ditambah **Saldo Awal**, sehingga tidak ada laporan yang diketik manual.

## Alur besar (dari input sampai laporan)
1. **Persiapan (sekali di awal / bila ada perubahan):** Daftar Akun (COA) → Rekening & Harian (master rekening) → Saldo Awal → Monitor & Pengaturan (kebijakan hak amil, tanggal cut-over).
2. **Input harian:** Input Jurnal (Penerimaan, Penyaluran, Beban Operasional, Transfer Antar Dana).
3. **Pemeriksaan harian:** Daftar Jurnal, Rekening & Harian (cocokkan saldo bank), Monitor & Pengaturan (jurnal timpang / kontaminasi dana).
4. **Akhir bulan:** Setoran Internal, rekonsiliasi akhir bulan, Tutup Buku.
5. **Laporan:** Perubahan Dana (LPD), Laba Rugi, Buku Besar, Neraca, Neraca Saldo, Posisi Keuangan.

## Istilah penting
| Istilah | Arti |
| Dana | Kantong dana yang dipisah pembukuannya: ZAKAT, INFAQ (termasuk campaign / infaq terikat), DSKL, PENGELOLA (amil), WAKAF |
| Jurnal | Satu bukti transaksi (nomor bukti) berisi baris debit & kredit yang seimbang |
| POSTED | Jurnal sah dan masuk laporan |
| VOID | Jurnal dibatalkan; tetap tersimpan untuk jejak audit tetapi tidak dihitung |
| Saldo Awal | Saldo pembukaan tiap akun saat sistem mulai dipakai (tanggal cut-over) |
| Tutup buku | Mengunci satu periode (bulan) agar tidak berubah lagi |

> Wakaf memiliki pembukuan dan laporan sendiri di menu **Wakaf**. Laporan di menu Administrasi adalah gabungan Zakat, Infaq, DSKL, dan Pengelola.`,
  },
  {
    judul: "2. Peran & Tanggung Jawab",
    isi: `Saat ini semua pengguna BO berperan teknis **ADMIN** (hak akses sama). Pembagian di bawah adalah **SOP internal** agar ada pemisahan tugas (input ≠ pemeriksa ≠ penyetuju). Sesuaikan nama jabatan dengan struktur organisasi.

| Peran internal | Tugas utama di sistem | Menu yang dipakai |
| Admin Sistem / IT | Mengelola akun COA, master rekening, pengguna, konfigurasi | Daftar Akun (COA), Rekening & Harian (master), Monitor & Pengaturan → Pengaturan |
| Staf Keuangan (Input) | Mencatat seluruh transaksi harian sesuai bukti | Input Jurnal, Daftar Jurnal |
| Kasir / Bendahara | Memperbarui saldo riil bank & kas, setoran unit | Rekening & Harian, Setoran Internal |
| Supervisor / Verifikator Keuangan | Memeriksa jurnal, koreksi/VOID, memantau anomali | Daftar Jurnal, Monitor & Pengaturan, Buku Besar |
| Kepala / Manajer Keuangan | Menyetujui tutup buku, mengesahkan laporan bulanan | Tutup Buku, semua menu Laporan |
| Pimpinan / Direktur | Membaca laporan untuk keputusan | Laba Rugi, Neraca, Posisi Keuangan, LPD |
| Auditor (internal/eksternal) | Menelusuri angka laporan sampai bukti jurnal | Semua laporan (klik baris → Buku Besar → Jurnal), Monitor → Audit |

## Aturan pemisahan tugas (disarankan)
- Orang yang **menginput** jurnal tidak memVOID jurnalnya sendiri tanpa persetujuan Supervisor.
- **Tutup buku** dan **Buka kembali** periode hanya oleh Kepala Keuangan; alasan wajib diisi dan tercatat di audit.
- Perubahan **COA**, **kebijakan hak amil**, dan **tanggal cut-over** hanya oleh Admin Sistem atas persetujuan Kepala Keuangan.`,
  },
  {
    judul: "3. Persiapan Awal (Data Master)",
    isi: `Dilakukan sekali saat mulai memakai sistem, atau ketika ada akun/rekening baru. **Peran:** Admin Sistem, disetujui Kepala Keuangan.

## 3.1 Daftar Akun (COA)
1. Buka **Administrasi → Daftar Akun (COA)** → \`+ Tambah akun\`.
2. Isi **Kode akun**, **Nama akun**, **Tipe akun** (Asset, Liability, Equity, Revenue, Expense) dan **Akun induk** bila ada.
3. Pilih **Dana** pemilik akun (menentukan buku/ruang tempat akun tampil) dan **Kelompok laporan**:
- KAS_BANK = kas & rekening bank; ASET_LAIN; ANTAR_DANA = rekening antar dana; KEWAJIBAN; SALDO_DANA
- PENERIMAAN, BAGI_HASIL, PENDAYAGUNAAN (penyaluran), BEBAN_OPERASIONAL
4. Untuk akun pendayagunaan Zakat wajib isi **Asnaf**; isi juga **Bidang program**, **Nama pendek / Grup / Urutan di LPD** agar rapi di laporan LPD.
5. Centang **Dapat diposting** hanya untuk akun yang boleh dipakai di jurnal (akun induk biasanya tidak).
> Kelompok laporan menentukan posisi akun di Laba Rugi, Neraca, dan LPD. Salah kelompok = salah laporan.

## 3.2 Master rekening (Rekening & Harian)
1. Buat dulu akun COA berkelompok **KAS_BANK**.
2. Buka **Rekening & Harian** → bagian *Master rekening* → \`+ Tambah rekening\`.
3. Pilih akun COA, isi **Kode bank** (mis. BSI, MDR — sama dengan aplikasi mobile), nama bank, nomor rekening (tersamar), **Dana pokok**, dan centang *Kas tunai* bila bukan rekening bank.
4. Rekening ini yang muncul sebagai pilihan "Masuk ke rekening / Dibayar dari rekening" di Input Jurnal.

## 3.3 Saldo Awal
1. Buka **Saldo Awal** → \`Create Saldo Awal\`.
2. Pilih **bulan & tahun berlaku** (biasanya bulan cut-over), isi nilai tiap akun, lalu \`Simpan Saldo Awal\`.
3. Kembali ke daftar: gunakan filter **cari kode/nama** dan **periode** (termasuk "Belum ada saldo awal") untuk memastikan semua akun sudah terisi; cek total.
> Total saldo awal debit harus sama dengan kredit. Setelah diisi, cek **Neraca** bulan pertama: Jumlah Aset harus sama dengan Jumlah Kewajiban + Saldo Dana.

## 3.4 Pengaturan (Monitor & Pengaturan → tab Pengaturan)
- **tanggal_cutover**: tanggal efektif saldo awal. Mengubahnya mengubah saldo berantai di seluruh laporan dan aplikasi — hanya dengan persetujuan Kepala Keuangan.
- **mode_penegakan**: PANTAU (pelanggaran dana dicatat) atau TEGAS (ditolak).
- **Kebijakan hak amil**: persen potongan amil per dana/jenis (Zakat maks. 12,5%, lainnya maks. 20%) beserta tanggal berlaku. Berlaku untuk penerimaan yang disimpan sesudahnya; jurnal lama tidak dihitung ulang.`,
  },
  {
    judul: "4. Input Transaksi Harian (Input Jurnal)",
    isi: `**Peran:** Staf Keuangan (Input). **Kapan:** setiap hari, berdasarkan bukti (slip bank, kuitansi, memo penyaluran, nota).

Buka **Administrasi → Input Jurnal**. Ada 4 tab; sistem menyusun baris debit/kredit otomatis dan menampilkan **pratinjau jurnal** sebelum disimpan.

## 4.1 Penerimaan
1. Isi **Tanggal**, pilih **Dana** (Zakat / Infaq / DSKL / Pengelola) dan **Akun penerimaan**.
2. Pilih **Masuk ke rekening** (hanya rekening milik dana terpilih yang tampil; ketik nama bank/nomor untuk mencari).
3. Isi **Nominal**, **Nama donatur/muzaki** (ketik untuk mencari donatur terdaftar), **Metode bayar**, **Keterangan**.
4. Bila ada kebijakan hak amil yang berlaku, sistem menampilkan **potongan hak amil** dan pratinjau **jurnal alokasi** yang dibuat otomatis (nomor bukti terpisah).
5. Klik simpan; nomor bukti muncul di riwayat di bawah form.

## 4.2 Penyaluran
1. Pilih **Dana sumber**; untuk campaign pilih **Jenis (campaign)** — dibayar dari Dana Infaq Terikat milik campaign tersebut.
2. Pilih **Program / akun pendayagunaan** dan **Dibayar dari rekening**.
3. Isi penerima (bisa lebih dari satu baris: \`+\` tambah baris), asnaf, jumlah, dan keterangan.

## 4.3 Beban Operasional
Untuk biaya operasional amil (gaji, listrik, ATK, dll.). Pilih **Akun beban** dan **Dibayar dari rekening (Dana Pengelola)**, isi nominal & keterangan.

## 4.4 Transfer Antar Dana
Dipakai saat uang **benar-benar berpindah** antar dana, mis. menyapu hak amil dari rekening Zakat ke rekening Amil. Isi dana asal/tujuan, rekening asal/tujuan, nominal, keterangan.
> Transfer antar dana dan alokasi hak amil **tidak** dihitung sebagai pendapatan/beban di Laba Rugi agar tidak ganda.

## 4.5 Riwayat input (di bawah setiap tab)
- Filter **tanggal awal s.d. tanggal akhir**, status, dan pencarian.
- \`Cetak PDF\`, \`Excel\`, \`CSV\` mengikuti filter yang aktif.
- Jurnal dapat **diedit** dari riwayat: nomor bukti tetap sama, isi lama disimpan sebagai riwayat, alokasi hak amil ikut dihitung ulang.

## Tips input yang benar
- Satu bukti fisik = satu jurnal. Tulis keterangan yang jelas (nama donatur/penerima, nomor kuitansi).
- Pastikan dana dan rekening sesuai; uang Zakat tidak boleh tercatat masuk ke rekening dana lain.
- Periode yang sudah **ditutup** tidak bisa diinput/diedit; minta Kepala Keuangan bila perlu dibuka kembali.`,
  },
  {
    judul: "5. Memeriksa & Mengoreksi Jurnal (Daftar Jurnal)",
    isi: `**Peran:** Supervisor / Verifikator. **Kapan:** harian atau minimal mingguan.

1. Buka **Daftar Jurnal**. Filter berdasarkan **tanggal awal s.d. akhir**, dana, jenis, status, akun, atau kata kunci.
2. Daftar ditampilkan **50 jurnal per halaman**; gunakan \`‹ Sebelumnya\` / \`Berikutnya ›\`.
3. Klik nomor bukti untuk melihat detail: baris debit/kredit, donatur atau penerima, status & sumber.
4. Dari detail bisa \`Cetak\` (bukti jurnal PDF) atau \`Unduh Excel\`.
5. Bila jurnal salah dan tidak bisa diedit, gunakan \`Batalkan (VOID)\` dengan **alasan wajib**, lalu input ulang jurnal yang benar.
6. \`Unduh CSV\`, \`Unduh Excel\`, \`Cetak\` di atas daftar mengekspor seluruh jurnal sesuai filter.

> VOID tidak menghapus data. Jurnal VOID tetap tampil (status abu-abu) untuk jejak audit tetapi tidak dihitung di laporan.`,
  },
  {
    judul: "6. Rekonsiliasi Bank & Kas (Rekening & Harian)",
    isi: `**Peran:** Kasir / Bendahara, diperiksa Supervisor. **Kapan:** harian (minimal sebelum tutup buku).

Tujuan halaman ini: mencocokkan **uang yang tercatat di sistem** dengan **uang yang sebenarnya ada di rekening bank/kas**. Hasilnya juga tampil di Laporan Harian aplikasi mobile.

1. Pilih ruang: **Ruang Zakat**, **Ruang Umum (Infaq & DSKL)**, atau **Ruang Wakaf**.
2. **Langkah 1 – Saldo bank:** isi saldo riil setiap rekening dari mutasi/m-banking pada kolom *Perbarui*, lalu \`Simpan\`.
3. **Langkah 2 – Sumber dana:** saldo tiap dana dihitung otomatis dari jurnal.
4. Lihat kotak **Selisih**. *Seimbang* = cocok. Bila ada selisih, kemungkinan:
- ada transaksi bank yang belum dijurnal (mis. biaya admin, bagi hasil);
- uang satu dana tercatat di rekening dana lain;
- salah nominal input.
5. Telusuri dengan **Buku Besar** akun bank terkait, perbaiki jurnalnya, lalu cek ulang sampai seimbang.`,
  },
  {
    judul: "7. Setoran Internal & Monitor",
    isi: `## 7.1 Setoran Internal (Rekap ZIS DSKL)
**Peran:** Kasir / Bendahara. Mencatat setoran ZIS dari unit-unit YBWSA per periode (langkah 3 Laporan Harian di aplikasi mobile).
1. Pilih bulan di kanan atas.
2. Isi nilai setoran tiap unit lalu \`Simpan\`; \`+ Unit\` untuk menambah unit baru.

## 7.2 Monitor & Pengaturan
**Peran:** Supervisor (pantau), Admin Sistem (pengaturan). Klik tab untuk berpindah; \`Muat ulang\` mengambil data terbaru.
| Tab | Isi | Target |
| Sinkron Mobile | Versi data per ruang yang dibaca aplikasi mobile | Versi naik setiap ada perubahan |
| Kontaminasi Dana | Baris jurnal yang dananya berbeda dari dana akun | Nol; selesaikan dengan Transfer Antar Dana |
| Jurnal Timpang | Jurnal yang debit ≠ kredit dalam satu dana | Nol |
| Akun Netral | Akun tanpa dana yang masih dipakai transaksi | Nol; pecah per dana lalu reklasifikasi |
| Pelanggaran | Catatan pelanggaran aturan dana (mode PANTAU) | Ditindaklanjuti |
| Audit | Riwayat aksi penting (VOID, tutup/buka buku, konfigurasi, panduan) | Untuk pemeriksaan |
| Pengaturan | Konfigurasi & kebijakan hak amil | Diubah hanya oleh yang berwenang |`,
  },
  {
    judul: "8. Tutup Buku Bulanan",
    isi: `**Peran:** disiapkan Supervisor, dieksekusi Kepala / Manajer Keuangan. **Kapan:** awal bulan berikutnya (mis. paling lambat tanggal 10).

## Checklist sebelum tutup buku
1. Semua bukti bulan tersebut sudah diinput (Input Jurnal) dan diperiksa (Daftar Jurnal).
2. Rekening & Harian **seimbang** untuk semua ruang.
3. Monitor: **Jurnal Timpang = 0**, **Kontaminasi Dana = 0**.
4. Setoran Internal bulan tsb. sudah diisi.
5. Neraca bulan tsb.: Jumlah Aset = Jumlah Kewajiban + Saldo Dana; Neraca Saldo: Jumlah Debit = Jumlah Kredit.

## Langkah
1. Buka **Tutup Buku**. Klik \`Periksa\` pada periode — sistem memeriksa semua jurnal seimbang per dana dan neraca tiap dana seimbang.
2. Bila lolos, klik \`Tutup buku\`. Status menjadi **CLOSED** dan saldo dana per periode disimpan.
3. Periode harus ditutup **berurutan**.
4. Bila harus koreksi, \`Buka kembali\` dengan alasan wajib (periode sesudahnya ikut terbuka; tercatat di audit), koreksi, lalu tutup lagi.`,
  },
  {
    judul: "9. Menghasilkan Laporan Keuangan",
    isi: `**Peran:** Kepala Keuangan menyiapkan & mengesahkan; Pimpinan dan Auditor membaca. Semua laporan ada di baris **Laporan**.

## Filter yang sama di setiap laporan bulanan
- Isi **tahun**, lalu pilih **"Semua bulan (tahunan)"** (satu kolom per bulan) atau **satu bulan (bulanan)**.
- \`Unduh CSV\` dan \`Cetak\` (PDF berkop) mengikuti pilihan tersebut.
- Neraca, Neraca Saldo, dan Posisi Keuangan memakai **pagination 25 baris per halaman**; ekspor tetap berisi seluruh baris.

## Laporan yang tersedia
| Laporan | Isi | Dipakai untuk |
| Perubahan Dana (LPD) | Ringkasan seperti LAP BANK (tab Dana, Campaign, Bidang, Bank/Tunai: saldo awal, masuk, keluar, saldo akhir + diagram pie), lalu rincian penerimaan & pendayagunaan per dana | Laporan pertanggungjawaban per dana |
| Laba Rugi | Pendapatan − beban gabungan semua dana (tanpa alokasi amil & transfer antar dana) | Kinerja bulanan/tahunan |
| Buku Besar | Mutasi & saldo per akun pada rentang tanggal | Rincian & rekonsiliasi |
| Neraca | Saldo setiap akun per akhir bulan: Aset, Kewajiban, Saldo Dana | Posisi harta & dana |
| Neraca Saldo | Saldo debit/kredit semua akun per akhir bulan | Cek keseimbangan sebelum laporan |
| Posisi Keuangan | Format ISAK 35: Aset, Liabilitas, Aset Neto, ringkas per dana | Laporan resmi |

## Ringkasan LAP BANK (di halaman Perubahan Dana)
1. Pilih tahun dan bulan. Panel **Ringkasan** berisi tab **Dana**, **Campaign**, **Bidang**, dan **Bank / Tunai**, masing-masing dengan kolom Saldo awal, Masuk, Keluar, Saldo akhir.
2. Tab **Bidang** mengambil bidang dari akun pendayagunaan (Daftar Akun → Bidang program) atau kategori campaign. Lengkapi bidang akun agar baris "Belum ada bidang" mengecil.
3. Tab **Bank / Tunai** sama dengan Rekening & Harian; klik nama rekening untuk melihat buku besarnya.
4. \`Unduh CSV ringkasan\` dan \`Cetak ringkasan\` memuat keempat tabel sekaligus.

## Buku Besar
1. Pilih mode: **Single akun** (1 dropdown), **Multiple akun** (2 dropdown), atau **Semua akun** (tanpa dropdown; hanya akun yang punya saldo/mutasi).
2. Isi tanggal awal s.d. akhir → \`Tampilkan\`.
3. Setiap akun menampilkan saldo awal, mutasi, saldo berjalan, dan saldo akhir. Klik **No. Bukti** untuk membuka jurnal.

## Telusur angka (traceability)
1. Di **Laba Rugi**, **Neraca**, **Neraca Saldo**, atau **Posisi Keuangan**, klik **nama baris / nomor akun** yang berwarna biru.
2. Muncul pop-up **Buku Besar** untuk baris tersebut sesuai bulan/tahun yang dipilih (saldo akhirnya sama dengan angka di laporan).
3. Klik **No. Bukti** di pop-up untuk membuka **detail jurnal**, lalu \`Cetak\` atau \`Unduh Excel\` bila perlu sebagai lampiran.

## Urutan pemeriksaan laporan bulanan (disarankan)
1. Neraca Saldo → debit = kredit.
2. Neraca → aset = kewajiban + saldo dana.
3. Laba Rugi → periksa pos yang tidak wajar dengan menelusuri baris.
4. LPD per dana → saldo akhir sesuai saldo dana di Neraca.
5. Posisi Keuangan → cetak, paraf, dan arsipkan bersama CSV.`,
  },
  {
    judul: "10. Jadwal Kerja & Tanya Jawab",
    isi: `## Jadwal kerja
| Frekuensi | Kegiatan | Peran |
| Harian | Input jurnal dari bukti; perbarui saldo bank; cek selisih | Staf Keuangan, Kasir |
| Mingguan | Periksa Daftar Jurnal & Monitor; koreksi/VOID | Supervisor |
| Bulanan | Setoran Internal, checklist & Tutup Buku, cetak laporan | Kasir, Kepala Keuangan |
| Tahunan | Laporan tahunan (pilih "Semua bulan"), review COA & kebijakan hak amil | Kepala Keuangan, Pimpinan |

## Tanya jawab
- **Tombol Unduh CSV/Cetak memunculkan "Tidak ada data".** Belum ada jurnal pada tahun/bulan/filter tersebut; ganti filter.
- **Neraca tidak seimbang.** Cek Monitor → Jurnal Timpang, dan pastikan Saldo Awal debit = kredit.
- **Rekening & Harian selisih.** Telusuri Buku Besar akun bank; cari transaksi bank yang belum dijurnal atau salah dana.
- **Tidak bisa input/edit di bulan lalu.** Periode sudah ditutup; minta Kepala Keuangan membuka kembali.
- **Angka laporan berbeda dengan Excel lama.** Telusuri baris (klik) sampai ke jurnal untuk menemukan perbedaannya.

## Mengubah panduan ini
Panduan ini dapat disesuaikan: klik \`Edit panduan\`, ubah judul/isi bagian, tambah/hapus/urutkan bagian, lalu \`Simpan\`. Perubahan berlaku untuk semua pengguna dan tercatat di Monitor → Audit. \`Kembalikan ke bawaan\` memulihkan isi awal.`,
  },
];
