import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applySchema() {
  let connection;
  
  try {
    console.log('Connecting to MySQL...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 20000
    });

    console.log('Connected successfully!');
    
    // Select database
    const dbName = process.env.DB_NAME || 'clinic_queue_db';
    console.log(`Selecting database: ${dbName}`);
    await connection.query(`USE ${dbName}`);
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '../migrations/create_tables_only.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Applying new schema...');
    console.log('This will create a new database structure with Indonesian table names.');
    console.log('');
    
    // Execute SQL
    await connection.query(sql);
    
    console.log('✓ Schema applied successfully!');
    console.log('');
    console.log('Database tables created:');
    console.log('  - admin (id_admin, nama_admin, email, password)');
    console.log('  - pasien (NIK_pasien, nama_pasien, ...)');
    console.log('  - dokter (id_dokter, nama_dokter, spesialisasi, ...)');
    console.log('  - pendaftaran_online');
    console.log('  - nomor_antrian');
    console.log('  - rekam_medis');
    console.log('  - riwayat_kunjungan');
    console.log('  - konsultasi_online');
    console.log('  - notifikasi');
    console.log('  - dashboard_klinik');
    console.log('');
    console.log('Sample data has been inserted.');
    console.log('');
    console.log('Default credentials:');
    console.log('  Admin: admin@kliniksehat.com / admin123');
    console.log('  Dokter: dokter@kliniksehat.com / dokter123');
    console.log('  Pasien: pasien@kliniksehat.com / pasien123');
    
  } catch (error) {
    console.error('Error applying schema:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

applySchema();
