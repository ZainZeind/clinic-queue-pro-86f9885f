import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import { validatePhone, validateNIK, validatePassword } from '../utils/validation.js';

// ==========================================
// QUEUE MANAGEMENT (NOMOR ANTRIAN)
// ==========================================

export const getTodayQueue = async (req, res) => {
  try {
    // Use CURDATE() from MySQL to get current date in server timezone
    console.log('🔍 [Admin] Getting today queue...');

    // Debug: Check all queue dates
    const [allQueues] = await pool.query(
      'SELECT tanggal_antrian, COUNT(*) as count FROM nomor_antrian GROUP BY tanggal_antrian ORDER BY tanggal_antrian DESC LIMIT 5'
    );
    console.log('📅 [Admin] Available queue dates:', allQueues);

    // Debug: Check what CURDATE() returns
    const [dateCheck] = await pool.query('SELECT CURDATE() as today, NOW() as now');
    console.log('📅 [Admin] Database current date:', dateCheck[0]);

    const [queue] = await pool.query(
      `SELECT 
        na.id_antrian as id,
        na.nomor_antrian as queue_number,
        na.NIK_pasien,
        na.nama_pasien as patient_name,
        na.tanggal_antrian as queue_date,
        na.waktu_mulai as start_time,
        na.waktu_selesai as end_time,
        na.status_antrian,
        CASE 
          WHEN na.status_antrian = 'Menunggu' THEN 'waiting'
          WHEN na.status_antrian = 'Dipanggil' THEN 'in_progress'
          WHEN na.status_antrian = 'Sedang Dilayani' THEN 'in_progress'
          WHEN na.status_antrian = 'Selesai' THEN 'completed'
          WHEN na.status_antrian = 'Batal' THEN 'skipped'
          ELSE 'waiting'
        END as status,
        na.prioritas,
        d.nama_dokter as doctor_name,
        d.spesialisasi,
        po.keluhan_pasien as complaint,
        po.waktu_daftar as appointment_time
       FROM nomor_antrian na
       LEFT JOIN dokter d ON na.id_dokter = d.id_dokter
       LEFT JOIN pendaftaran_online po ON na.id_pendaftaran = po.id_pendaftaran
       WHERE DATE(na.tanggal_antrian) = CURDATE()
       ORDER BY na.prioritas DESC, na.nomor_antrian ASC`
    );

    console.log('📊 [Admin] Found', queue.length, 'queue items');
    if (queue.length > 0) {
      console.log('📝 [Admin] First queue item:', queue[0]);
    } else {
      console.log('⚠️ [Admin] No queue items found today.');
      // Try to get any recent queue
      const [recentQueue] = await pool.query(
        `SELECT tanggal_antrian, COUNT(*) as count 
         FROM nomor_antrian 
         WHERE tanggal_antrian >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
         GROUP BY tanggal_antrian
         ORDER BY tanggal_antrian DESC`
      );
      console.log('📅 [Admin] Recent queues (last 3 days):', recentQueue);
    }

    res.json({ queue });
  } catch (error) {
    console.error('❌ [Admin] Get today queue error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const callQueue = async (req, res) => {
  try {
    const { queue_id } = req.body;

    const [result] = await pool.query(
      `UPDATE nomor_antrian 
       SET status_antrian = 'Sedang Dilayani', waktu_mulai = NOW() 
       WHERE id_antrian = ?`,
      [queue_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Antrian tidak ditemukan' });
    }

    // Get queue info for notification
    const [queueInfo] = await pool.query(
      `SELECT nomor_antrian, NIK_pasien, nama_pasien 
       FROM nomor_antrian 
       WHERE id_antrian = ?`,
      [queue_id]
    );

    if (queueInfo.length > 0) {
      await pool.query(
        `INSERT INTO notifikasi (id_antrian, NIK_pasien, judul_notifikasi, isi_notifikasi, jenis_notifikasi, status_antrian)
         VALUES (?, ?, ?, ?, 'Antrian', 'Dipanggil')`,
        [queue_id, queueInfo[0].NIK_pasien, 'Giliran Anda', 
         `Nomor antrian ${queueInfo[0].nomor_antrian} dipanggil. Silakan menuju ruang praktek.`]
      );
    }

    res.json({ message: 'Pasien telah dipanggil' });
  } catch (error) {
    console.error('Call queue error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const completeQueue = async (req, res) => {
  try {
    const { queue_id } = req.body;

    const [result] = await pool.query(
      `UPDATE nomor_antrian 
       SET status_antrian = 'Selesai', waktu_selesai = NOW() 
       WHERE id_antrian = ?`,
      [queue_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Antrian tidak ditemukan' });
    }

    res.json({ message: 'Antrian telah selesai' });
  } catch (error) {
    console.error('Complete queue error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const skipQueue = async (req, res) => {
  try {
    const { queue_id } = req.body;

    const [result] = await pool.query(
      `UPDATE nomor_antrian SET status_antrian = 'Batal' WHERE id_antrian = ?`,
      [queue_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Antrian tidak ditemukan' });
    }

    res.json({ message: 'Antrian telah dibatalkan' });
  } catch (error) {
    console.error('Skip queue error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

// ==========================================
// USER MANAGEMENT
// ==========================================

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    let users = [];

    if (!role || role === 'admin') {
      const [admins] = await pool.query(
        `SELECT id_admin as id, nama_admin as full_name, email, 'admin' as role, created_at 
         FROM admin 
         ORDER BY created_at DESC`
      );
      users = [...users, ...admins];
    }

    if (!role || role === 'dokter') {
      const [dokters] = await pool.query(
        `SELECT id_dokter as id, nama_dokter as full_name, email, no_hp as phone, 
                spesialisasi, no_sip, status_aktif, 'dokter' as role, created_at 
         FROM dokter 
         ORDER BY created_at DESC`
      );
      users = [...users, ...dokters];
    }

    if (!role || role === 'pasien') {
      const [pasiens] = await pool.query(
        `SELECT NIK_pasien as id, nama_pasien as full_name, email, no_hp as phone, 
                alamat as address, tanggal_lahir as date_of_birth, jenis_kelamin as gender,
                golongan_darah, 'pasien' as role, created_at 
         FROM pasien 
         ORDER BY created_at DESC`
      );
      users = [...users, ...pasiens];
    }

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role, 
      full_name, 
      phone, 
      address, 
      date_of_birth, 
      gender,
      nik,
      specialization,
      sip 
    } = req.body;

    // Validate phone number if provided
    if (phone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
    }

    // Validate NIK for pasien
    if (role === 'pasien') {
      const nikValidation = validateNIK(nik);
      if (!nikValidation.valid) {
        return res.status(400).json({ message: nikValidation.message });
      }
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'admin') {
      const [result] = await pool.query(
        'INSERT INTO admin (nama_admin, email, password) VALUES (?, ?, ?)',
        [full_name, email, hashedPassword]
      );
      res.status(201).json({ message: 'Data admin telah ditambahkan', userId: result.insertId });

    } else if (role === 'dokter') {
      const [result] = await pool.query(
        'INSERT INTO dokter (nama_dokter, spesialisasi, no_sip, no_hp, email, password, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [full_name, specialization || 'Umum', sip || `SIP-${Date.now()}`, phone || '', email, hashedPassword, 'Aktif']
      );
      res.status(201).json({ message: 'Data dokter telah ditambahkan', userId: result.insertId });

    } else if (role === 'pasien') {
      if (!nik) {
        return res.status(400).json({ message: 'NIK wajib diisi untuk pasien' });
      }
      await pool.query(
        'INSERT INTO pasien (NIK_pasien, nama_pasien, tanggal_lahir, alamat, no_hp, email, jenis_kelamin, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nik, full_name, date_of_birth || '2000-01-01', address || '', phone || '', email || null, gender || 'Laki-laki', hashedPassword]
      );
      res.status(201).json({ message: 'Data pasien telah ditambahkan', userId: nik });
    }
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, email, password, full_name, phone, address, date_of_birth, gender, specialization } = req.body;

    // Validate phone number if provided
    if (phone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
    }

    // Validate password if provided (for update)
    if (password && password.trim() !== '') {
      const passwordValidation = validatePassword(password, true);
      if (!passwordValidation.valid) {
        return res.status(400).json({ message: passwordValidation.message });
      }
    }

    const hashedPassword = password && password.trim() !== '' ? await bcrypt.hash(password, 10) : null;

    if (role === 'admin') {
      if (hashedPassword) {
        await pool.query(
          'UPDATE admin SET nama_admin = ?, email = ?, password = ? WHERE id_admin = ?',
          [full_name, email, hashedPassword, id]
        );
      } else {
        await pool.query(
          'UPDATE admin SET nama_admin = ?, email = ? WHERE id_admin = ?',
          [full_name, email, id]
        );
      }
    } else if (role === 'dokter') {
      if (hashedPassword) {
        await pool.query(
          'UPDATE dokter SET nama_dokter = ?, email = ?, password = ?, no_hp = ?, spesialisasi = ? WHERE id_dokter = ?',
          [full_name, email, hashedPassword, phone, specialization, id]
        );
      } else {
        await pool.query(
          'UPDATE dokter SET nama_dokter = ?, email = ?, no_hp = ?, spesialisasi = ? WHERE id_dokter = ?',
          [full_name, email, phone, specialization, id]
        );
      }
    } else if (role === 'pasien') {
      if (hashedPassword) {
        await pool.query(
          'UPDATE pasien SET nama_pasien = ?, email = ?, password = ?, no_hp = ?, alamat = ?, tanggal_lahir = ?, jenis_kelamin = ? WHERE NIK_pasien = ?',
          [full_name, email, hashedPassword, phone, address, date_of_birth, gender, id]
        );
      } else {
        await pool.query(
          'UPDATE pasien SET nama_pasien = ?, email = ?, no_hp = ?, alamat = ?, tanggal_lahir = ?, jenis_kelamin = ? WHERE NIK_pasien = ?',
          [full_name, email, phone, address, date_of_birth, gender, id]
        );
      }
    }

    res.json({ message: 'Data user telah diperbarui' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.query;

    let result;

    if (role === 'admin') {
      [result] = await pool.query('DELETE FROM admin WHERE id_admin = ?', [id]);
    } else if (role === 'dokter') {
      [result] = await pool.query('DELETE FROM dokter WHERE id_dokter = ?', [id]);
    } else if (role === 'pasien') {
      [result] = await pool.query('DELETE FROM pasien WHERE NIK_pasien = ?', [id]);
    }

    if (result && result.affectedRows === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'Data user telah dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

// ==========================================
// PATIENT DATABASE
// ==========================================

export const getAllPatients = async (req, res) => {
  try {
    const [patients] = await pool.query(
      `SELECT 
        p.NIK_pasien as id,
        p.nama_pasien as full_name,
        p.email,
        p.no_hp as phone,
        p.alamat as address,
        p.tanggal_lahir as date_of_birth,
        p.jenis_kelamin as gender,
        p.golongan_darah,
        p.created_at,
        COUNT(DISTINCT po.id_pendaftaran) as total_visits,
        MAX(po.tanggal_pendaftaran) as last_visit
       FROM pasien p
       LEFT JOIN pendaftaran_online po ON p.NIK_pasien = po.NIK_pasien
       GROUP BY p.NIK_pasien
       ORDER BY p.created_at DESC`
    );

    res.json({ patients });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const getPatientDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [patient] = await pool.query(
      `SELECT 
        NIK_pasien as id,
        nama_pasien as full_name,
        email,
        no_hp as phone,
        alamat as address,
        tanggal_lahir as date_of_birth,
        jenis_kelamin as gender,
        golongan_darah,
        created_at
       FROM pasien
       WHERE NIK_pasien = ?`,
      [id]
    );

    if (patient.length === 0) {
      return res.status(404).json({ message: 'Pasien tidak ditemukan' });
    }

    const [appointments] = await pool.query(
      `SELECT 
        po.id_pendaftaran as id,
        po.tanggal_pendaftaran as appointment_date,
        po.waktu_daftar as appointment_time,
        po.keluhan_pasien as complaint,
        po.status_pendaftaran as status,
        d.nama_dokter as doctor_name,
        d.spesialisasi,
        na.nomor_antrian,
        na.status_antrian as queue_status
       FROM pendaftaran_online po
       LEFT JOIN dokter d ON po.id_dokter = d.id_dokter
       LEFT JOIN nomor_antrian na ON po.id_pendaftaran = na.id_pendaftaran
       WHERE po.NIK_pasien = ?
       ORDER BY po.tanggal_pendaftaran DESC`,
      [id]
    );

    const [medicalRecords] = await pool.query(
      `SELECT 
        rm.id_rekam_medis as id,
        rm.tanggal_periksa as record_date,
        rm.keluhan as symptoms,
        rm.diagnosa_pasien as diagnosis,
        rm.hasil_pemeriksaan as examination_result,
        rm.tindakan as treatment,
        rm.resep_obat as prescription,
        rm.catatan_dokter as notes,
        rm.biaya_pemeriksaan as cost,
        d.nama_dokter as doctor_name,
        d.spesialisasi
       FROM rekam_medis rm
       LEFT JOIN dokter d ON rm.id_dokter = d.id_dokter
       WHERE rm.NIK_pasien = ?
       ORDER BY rm.tanggal_periksa DESC`,
      [id]
    );

    res.json({
      patient: patient[0],
      appointments,
      medicalRecords
    });
  } catch (error) {
    console.error('Get patient detail error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

// ==========================================
// NOTIFICATIONS MANAGEMENT
// ==========================================

export const createNotification = async (req, res) => {
  try {
    const { nik_pasien, title, message, type, scheduled_at } = req.body;

    const [result] = await pool.query(
      `INSERT INTO notifikasi (NIK_pasien, judul_notifikasi, isi_notifikasi, jenis_notifikasi, waktu_kirim)
       VALUES (?, ?, ?, ?, ?)`,
      [nik_pasien, title, message, type || 'Umum', scheduled_at || null]
    );

    res.status(201).json({
      message: 'Notifikasi telah dikirim',
      notificationId: result.insertId
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const sendBulkNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    // Send to all patients
    const [patients] = await pool.query('SELECT NIK_pasien FROM pasien');

    const values = patients.map(p => [p.NIK_pasien, title, message, type || 'Umum']);

    if (values.length > 0) {
      await pool.query(
        'INSERT INTO notifikasi (NIK_pasien, judul_notifikasi, isi_notifikasi, jenis_notifikasi) VALUES ?',
        [values]
      );
    }

    res.json({ message: `Notifikasi telah dikirim ke ${values.length} pasien` });
  } catch (error) {
    console.error('Send bulk notification error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [totalPatients] = await pool.query(
      'SELECT COUNT(*) as count FROM pasien'
    );

    const [totalDoctors] = await pool.query(
      'SELECT COUNT(*) as count FROM dokter WHERE status_aktif = "Aktif"'
    );

    const [todayAppointments] = await pool.query(
      'SELECT COUNT(*) as count FROM pendaftaran_online WHERE tanggal_pendaftaran = ?',
      [today]
    );

    const [todayQueue] = await pool.query(
      'SELECT COUNT(*) as count FROM nomor_antrian WHERE tanggal_antrian = ? AND status_antrian IN ("Menunggu", "Dipanggil")',
      [today]
    );

    const [recentAppointments] = await pool.query(
      `SELECT 
        po.id_pendaftaran as id,
        po.nama_pasien as patient_name,
        po.tanggal_pendaftaran as appointment_date,
        po.waktu_daftar as appointment_time,
        po.status_pendaftaran as status,
        d.nama_dokter as doctor_name,
        d.spesialisasi,
        po.created_at
       FROM pendaftaran_online po
       LEFT JOIN dokter d ON po.id_dokter = d.id_dokter
       ORDER BY po.created_at DESC
       LIMIT 10`
    );

    // Get dashboard summary if exists
    const [dashboardData] = await pool.query(
      'SELECT * FROM dashboard_klinik WHERE tanggal_laporan = ? ORDER BY created_at DESC LIMIT 1',
      [today]
    );

    res.json({
      stats: {
        totalPatients: totalPatients[0].count,
        totalDoctors: totalDoctors[0].count,
        todayAppointments: todayAppointments[0].count,
        todayQueue: todayQueue[0].count,
        dashboardSummary: dashboardData.length > 0 ? dashboardData[0] : null
      },
      recentAppointments
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};
