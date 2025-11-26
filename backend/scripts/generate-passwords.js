import bcrypt from 'bcryptjs';

async function generatePasswords() {
  console.log('Generating password hashes for migration...\n');
  
  const passwords = {
    admin123: await bcrypt.hash('admin123', 10),
    dokter123: await bcrypt.hash('dokter123', 10),
    pasien123: await bcrypt.hash('pasien123', 10)
  };
  
  console.log('-- Password hashes for SQL migration');
  console.log('-- admin123 =', passwords.admin123);
  console.log('-- dokter123 =', passwords.dokter123);
  console.log('-- pasien123 =', passwords.pasien123);
  
  console.log('\n-- Sample Admin with admin123:');
  console.log(`INSERT INTO admin (nama_admin, email, password) VALUES ('Admin Klinik', 'admin@kliniksehat.com', '${passwords.admin123}');`);
  
  console.log('\n-- Sample Dokter with dokter123:');
  console.log(`INSERT INTO dokter (nama_dokter, spesialisasi, no_sip, no_hp, email, password, status_aktif) VALUES ('dr. Ahmad Hidayat, Sp.PD', 'Penyakit Dalam', 'SIP-001-2024', '081234567890', 'dokter@kliniksehat.com', '${passwords.dokter123}', 'Aktif');`);
  
  console.log('\n-- Sample Pasien with pasien123:');
  console.log(`INSERT INTO pasien (NIK_pasien, nama_pasien, tanggal_lahir, alamat, no_hp, email, jenis_kelamin, golongan_darah, password) VALUES ('3374010101900001', 'Andi Wijaya', '1990-01-01', 'Jl. Merdeka No. 123, Semarang', '082123456789', 'pasien@kliniksehat.com', 'Laki-laki', 'A+', '${passwords.pasien123}');`);
}

generatePasswords().catch(console.error);
