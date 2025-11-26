# Dokumentasi Database Klinik Sehat

## Daftar Tabel

### 1. **admin**
Menyimpan data administrator sistem
- `id_admin` (PK): ID admin
- `nama_admin`: Nama lengkap admin
- `email`: Email untuk login
- `password`: Password terenkripsi (bcrypt)
- `created_at`, `updated_at`: Timestamp

### 2. **pasien**
Menyimpan data lengkap pasien
- `NIK_pasien` (PK): NIK 16 digit sebagai primary key
- `nama_pasien`: Nama lengkap pasien
- `tanggal_lahir`: Tanggal lahir
- `alamat`: Alamat lengkap
- `no_hp`: Nomor HP/WhatsApp
- `email`: Email pasien
- `jenis_kelamin`: Laki-laki/Perempuan
- `golongan_darah`: A, B, AB, O (dengan +/-)
- `password`: Password untuk login pasien

### 3. **dokter**
Menyimpan data dokter
- `id_dokter` (PK): ID dokter auto increment
- `nama_dokter`: Nama lengkap dokter
- `spesialisasi`: Spesialisasi dokter
- `no_sip`: Nomor Surat Izin Praktik (unik)
- `no_hp`: Nomor HP dokter
- `email`: Email untuk login
- `password`: Password terenkripsi
- `jadwal_praktik`: JSON format jadwal (hari & jam)
- `status_aktif`: Aktif/Tidak Aktif

### 4. **pendaftaran_online**
Menyimpan pendaftaran pasien secara online
- `id_pendaftaran` (PK): ID pendaftaran
- `NIK_pasien` (FK): NIK pasien
- `nama_pasien`: Nama pasien
- `id_dokter` (FK): Dokter yang dipilih
- `tanggal_pendaftaran`: Tanggal kunjungan
- `waktu_daftar`: Jam kunjungan
- `keluhan_pasien`: Keluhan/gejala
- `jenis_layanan`: Jenis layanan yang dipilih
- `status_pendaftaran`: Pending/Dikonfirmasi/Dibatalkan/Selesai

### 5. **nomor_antrian**
Menyimpan antrian pasien
- `id_antrian` (PK): ID antrian
- `nomor_antrian`: Nomor urut antrian
- `id_pendaftaran` (FK): Referensi ke pendaftaran
- `NIK_pasien` (FK): NIK pasien
- `nama_pasien`: Nama pasien
- `id_dokter` (FK): Dokter yang menangani
- `tanggal_antrian`: Tanggal antrian
- `waktu_mulai`, `waktu_selesai`: Waktu layanan
- `status_antrian`: Menunggu/Dipanggil/Sedang Dilayani/Selesai/Batal
- `prioritas`: Normal/Urgent

### 6. **rekam_medis**
Menyimpan rekam medis pasien
- `id_rekam_medis` (PK): ID rekam medis
- `NIK_pasien` (FK): NIK pasien
- `nama_pasien`: Nama pasien
- `id_dokter` (FK): Dokter yang memeriksa
- `tanggal_periksa`: Tanggal & waktu pemeriksaan
- `keluhan`: Keluhan pasien
- `diagnosa_pasien`: Diagnosis dari dokter
- `hasil_pemeriksaan`: Hasil pemeriksaan lengkap
- `tindakan`: Tindakan medis yang dilakukan
- `resep_obat`: Resep obat
- `catatan_dokter`: Catatan tambahan
- `biaya_pemeriksaan`: Biaya

### 7. **riwayat_kunjungan**
Menyimpan history kunjungan pasien
- `id_kunjungan` (PK): ID kunjungan
- `NIK_pasien` (FK): NIK pasien
- `nama_pasien`: Nama pasien
- `id_dokter` (FK): Dokter yang dikunjungi
- `tanggal_kunjungan`: Tanggal kunjungan
- `jenis_kunjungan`: Konsultasi/Pemeriksaan/Kontrol/Tindakan
- `status_kunjungan`: Selesai/Batal
- `catatan`: Catatan kunjungan

### 8. **konsultasi_online**
Menyimpan chat/konsultasi online
- `id_konsultasi` (PK): ID konsultasi
- `NIK_pasien` (FK): NIK pasien
- `nama_pasien`: Nama pasien
- `id_dokter` (FK): Dokter konsultan
- `teks_pesan`: Isi pesan/chat
- `status_pesan`: Terkirim/Terbaca/Dibalas
- `pengirim`: Pasien/Dokter
- `waktu_kirim`: Timestamp kirim
- `waktu_dibaca`: Timestamp dibaca

### 9. **notifikasi**
Menyimpan notifikasi ke pasien
- `id_notifikasi` (PK): ID notifikasi
- `id_antrian` (FK): Referensi antrian
- `NIK_pasien` (FK): NIK pasien
- `judul_notifikasi`: Judul notif
- `isi_notifikasi`: Isi pesan
- `jenis_notifikasi`: Antrian/Pendaftaran/Hasil/Pengingat/Umum
- `status_antrian`: Status antrian saat notif dikirim
- `status_baca`: Belum Dibaca/Sudah Dibaca
- `waktu_kirim`: Waktu pengiriman
- `metode_kirim`: Email/SMS/Push/In-App

### 10. **dashboard_klinik**
Menyimpan statistik harian klinik
- `id_dashboard` (PK): ID dashboard
- `tanggal_laporan`: Tanggal laporan (unique)
- `jumlah_pasien_datang`: Total pasien datang
- `jumlah_pasien_antri`: Total yang masih antri
- `jumlah_pasien_selesai`: Total selesai dilayani
- `jumlah_pasien_batal`: Total batal
- `jumlah_pendaftaran_online`: Total daftar online
- `rata_rata_waktu_tunggu`: Rata-rata waktu tunggu
- `catatan`: Catatan tambahan

## Views (Tampilan Query)

### v_antrian_aktif
View untuk melihat antrian aktif hari ini

### v_rekam_medis_lengkap
View untuk melihat rekam medis dengan data lengkap

### v_statistik_harian
View untuk statistik harian per tanggal

## Stored Procedures

### sp_generate_nomor_antrian
Generate nomor antrian otomatis untuk tanggal tertentu

### sp_update_status_antrian
Update status antrian dan kirim notifikasi otomatis

### sp_update_dashboard_stats
Update statistik dashboard untuk tanggal tertentu

## Triggers

### tr_update_dashboard_after_antrian
Auto-update dashboard saat status antrian berubah

### tr_create_riwayat_after_rekam_medis
Auto-create riwayat kunjungan saat rekam medis dibuat

## Relasi Tabel

```
pasien (NIK_pasien)
  ├─→ pendaftaran_online (NIK_pasien)
  ├─→ nomor_antrian (NIK_pasien)
  ├─→ rekam_medis (NIK_pasien)
  ├─→ riwayat_kunjungan (NIK_pasien)
  ├─→ konsultasi_online (NIK_pasien)
  └─→ notifikasi (NIK_pasien)

dokter (id_dokter)
  ├─→ pendaftaran_online (id_dokter)
  ├─→ nomor_antrian (id_dokter)
  ├─→ rekam_medis (id_dokter)
  ├─→ riwayat_kunjungan (id_dokter)
  └─→ konsultasi_online (id_dokter)

pendaftaran_online (id_pendaftaran)
  └─→ nomor_antrian (id_pendaftaran)

nomor_antrian (id_antrian)
  └─→ notifikasi (id_antrian)
```

## Cara Menjalankan Migration

```bash
# Masuk ke MySQL
mysql -u root -p

# Create database
CREATE DATABASE klinik_sehat;
USE klinik_sehat;

# Run migration
source /path/to/create_new_schema.sql
```

## Fitur Tambahan

1. **Auto-increment Nomor Antrian**: Nomor antrian otomatis per hari
2. **Trigger Notifikasi**: Notifikasi otomatis saat status berubah
3. **Dashboard Auto-update**: Stats dashboard update otomatis
4. **Riwayat Otomatis**: Riwayat kunjungan tercreate otomatis
5. **Indexes Optimized**: Query cepat dengan index yang tepat
6. **Soft Delete Ready**: Bisa ditambahkan deleted_at jika perlu
7. **Audit Trail**: Timestamp created_at & updated_at di semua tabel
8. **Data Validation**: ENUM untuk validasi data konsisten
