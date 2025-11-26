import pool from '../config/database.js';

// ==========================================
// DOCTOR SCHEDULES MANAGEMENT
// ==========================================

export const getSchedules = async (req, res) => {
  try {
    const doctorId = req.user.role === 'dokter' ? req.user.id : req.params.doctorId;
    
    const [dokter] = await pool.query(
      'SELECT jadwal_praktik FROM dokter WHERE id_dokter = ?',
      [doctorId]
    );

    if (dokter.length === 0) {
      return res.status(404).json({ message: 'Dokter tidak ditemukan' });
    }

    // Parse jadwal_praktik JSON
    let schedules = [];
    try {
      if (dokter[0].jadwal_praktik) {
        const jadwalObj = JSON.parse(dokter[0].jadwal_praktik);
        // Capitalize day names to match frontend
        const dayMap = {
          'senin': 'Senin',
          'selasa': 'Selasa', 
          'rabu': 'Rabu',
          'kamis': 'Kamis',
          'jumat': 'Jumat',
          'sabtu': 'Sabtu',
          'minggu': 'Minggu'
        };
        
        schedules = Object.keys(jadwalObj).map(day => {
          const capitalizedDay = dayMap[day.toLowerCase()] || day;
          const [start_time, end_time] = jadwalObj[day].split('-');
          return {
            id: `${day}-${jadwalObj[day]}`,
            day_of_week: capitalizedDay,
            time: jadwalObj[day],
            start_time: start_time?.trim() || '',
            end_time: end_time?.trim() || '',
            max_patients: 20,
            is_active: true
          };
        });
      }
    } catch (e) {
      console.error('Parse schedule error:', e);
      schedules = [];
    }

    res.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const createSchedule = async (req, res) => {
  try {
    const { schedules } = req.body; // Expected: {senin: "08:00-14:00", rabu: "08:00-14:00"}
    const doctorId = req.user.id;

    const jadwalJson = JSON.stringify(schedules);

    await pool.query(
      'UPDATE dokter SET jadwal_praktik = ? WHERE id_dokter = ?',
      [jadwalJson, doctorId]
    );

    res.status(201).json({
      message: 'Jadwal telah diperbarui'
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { schedules } = req.body;
    const doctorId = req.user.id;

    const jadwalJson = JSON.stringify(schedules);

    await pool.query(
      'UPDATE dokter SET jadwal_praktik = ? WHERE id_dokter = ?',
      [jadwalJson, doctorId]
    );

    res.json({ message: 'Jadwal telah diperbarui' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const { day } = req.params;
    const doctorId = req.user.id;

    // Get current schedules
    const [dokter] = await pool.query(
      'SELECT jadwal_praktik FROM dokter WHERE id_dokter = ?',
      [doctorId]
    );

    if (dokter.length === 0) {
      return res.status(404).json({ message: 'Dokter tidak ditemukan' });
    }

    let schedules = {};
    try {
      schedules = JSON.parse(dokter[0].jadwal_praktik || '{}');
    } catch (e) {
      schedules = {};
    }

    delete schedules[day];

    await pool.query(
      'UPDATE dokter SET jadwal_praktik = ? WHERE id_dokter = ?',
      [JSON.stringify(schedules), doctorId]
    );

    res.json({ message: 'Jadwal telah dihapus' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

// ==========================================
// MEDICAL RECORDS MANAGEMENT
// ==========================================

export const createMedicalRecord = async (req, res) => {
  try {
    const {
      nik_pasien,
      nama_pasien,
      keluhan,
      diagnosis,
      examination_result,
      treatment,
      prescription,
      notes,
      cost,
      record_date
    } = req.body;
    
    const doctorId = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO rekam_medis 
       (NIK_pasien, nama_pasien, id_dokter, tanggal_periksa, keluhan, diagnosa_pasien, 
        hasil_pemeriksaan, tindakan, resep_obat, catatan_dokter, biaya_pemeriksaan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nik_pasien, nama_pasien, doctorId, record_date || new Date(), keluhan, diagnosis, 
       examination_result, treatment, prescription, notes, cost || 0]
    );

    res.status(201).json({
      message: 'Rekam medis telah disimpan',
      recordId: result.insertId
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const getMedicalRecords = async (req, res) => {
  try {
    const { patient_id } = req.params;
    
    const [records] = await pool.query(
      `SELECT 
        rm.id_rekam_medis as id,
        rm.NIK_pasien,
        rm.nama_pasien as patient_name,
        rm.tanggal_periksa as record_date,
        rm.keluhan as complaint,
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
      [patient_id]
    );

    res.json({ records });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      keluhan,
      diagnosis,
      examination_result,
      treatment,
      prescription,
      notes,
      cost
    } = req.body;

    const [result] = await pool.query(
      `UPDATE rekam_medis 
       SET keluhan = ?, diagnosa_pasien = ?, hasil_pemeriksaan = ?, tindakan = ?,
           resep_obat = ?, catatan_dokter = ?, biaya_pemeriksaan = ?
       WHERE id_rekam_medis = ? AND id_dokter = ?`,
      [keluhan, diagnosis, examination_result, treatment, prescription, notes, cost, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rekam medis tidak ditemukan' });
    }

    res.json({ message: 'Rekam medis telah diperbarui' });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

// ==========================================
// TODAY'S PATIENTS
// ==========================================

export const getTodayPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;
    console.log('🔍 [Doctor] Getting patients for doctor:', doctorId);

    // Debug: Check all queue dates for this doctor
    const [allQueues] = await pool.query(
      'SELECT tanggal_antrian, COUNT(*) as count FROM nomor_antrian WHERE id_dokter = ? GROUP BY tanggal_antrian ORDER BY tanggal_antrian DESC LIMIT 5',
      [doctorId]
    );
    console.log('📅 [Doctor] Available queue dates for this doctor:', allQueues);

    // Debug: Check what CURDATE() returns
    const [dateCheck] = await pool.query('SELECT CURDATE() as today, NOW() as now');
    console.log('📅 [Doctor] Database current date:', dateCheck[0]);

    // Debug: Check all patients regardless of status
    const [allPatients] = await pool.query(
      `SELECT COUNT(*) as total, status_antrian 
       FROM nomor_antrian 
       WHERE id_dokter = ? AND DATE(tanggal_antrian) = CURDATE()
       GROUP BY status_antrian`,
      [doctorId]
    );
    console.log('📊 [Doctor] Patient count by status (today):', allPatients);

    const [patients] = await pool.query(
      `SELECT 
        na.id_antrian as id,
        na.nomor_antrian as queue_number,
        na.NIK_pasien,
        na.nama_pasien as full_name,
        na.status_antrian as queue_status,
        na.tanggal_antrian,
        na.waktu_mulai,
        na.prioritas,
        p.no_hp as phone,
        p.tanggal_lahir as date_of_birth,
        p.jenis_kelamin as gender,
        p.alamat as address,
        po.keluhan_pasien as complaint,
        po.waktu_daftar as appointment_time
       FROM nomor_antrian na
       LEFT JOIN pasien p ON na.NIK_pasien = p.NIK_pasien
       LEFT JOIN pendaftaran_online po ON na.id_pendaftaran = po.id_pendaftaran
       WHERE na.id_dokter = ? AND DATE(na.tanggal_antrian) = CURDATE() AND na.status_antrian IN ('Menunggu', 'Dipanggil', 'Sedang Dilayani')
       ORDER BY na.prioritas DESC, na.nomor_antrian ASC`,
      [doctorId]
    );

    console.log('✅ [Doctor] Found', patients.length, 'patients');
    if (patients.length > 0) {
      console.log('📝 [Doctor] First patient:', patients[0]);
    } else {
      console.log('⚠️ [Doctor] No patients found today.');
      // Try to get any recent patients
      const [recentPatients] = await pool.query(
        `SELECT tanggal_antrian, COUNT(*) as count 
         FROM nomor_antrian 
         WHERE id_dokter = ? AND tanggal_antrian >= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
         GROUP BY tanggal_antrian
         ORDER BY tanggal_antrian DESC`,
        [doctorId]
      );
      console.log('📅 [Doctor] Recent patients (last 3 days):', recentPatients);
    }

    res.json({ patients });
  } catch (error) {
    console.error('❌ [Doctor] Get today patients error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

// ==========================================
// DOCTOR CONSULTATIONS
// ==========================================

export const getDoctorConsultations = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Get unique consultations grouped by patient
    const [consultations] = await pool.query(
      `SELECT 
        ko.NIK_pasien as patient_id,
        ko.nama_pasien as patient_name,
        MAX(ko.waktu_kirim) as last_message_at,
        COUNT(*) as message_count,
        (SELECT teks_pesan FROM konsultasi_online 
         WHERE id_dokter = ? AND NIK_pasien = ko.NIK_pasien 
         ORDER BY waktu_kirim DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM konsultasi_online 
         WHERE id_dokter = ? AND NIK_pasien = ko.NIK_pasien 
         AND pengirim = 'Pasien' AND status_pesan != 'Terbaca') as unread_count
       FROM konsultasi_online ko
       WHERE ko.id_dokter = ?
       GROUP BY ko.NIK_pasien, ko.nama_pasien
       ORDER BY last_message_at DESC`,
      [doctorId, doctorId, doctorId]
    );

    res.json({ consultations });
  } catch (error) {
    console.error('Get doctor consultations error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const getDoctorConsultationMessages = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const doctorId = req.user.id;

    // Get doctor name
    const [doctor] = await pool.query(
      'SELECT nama_dokter FROM dokter WHERE id_dokter = ?',
      [doctorId]
    );

    // Get patient name
    const [patient] = await pool.query(
      'SELECT nama_pasien FROM pasien WHERE NIK_pasien = ?',
      [patient_id]
    );

    const doctorName = doctor.length > 0 ? doctor[0].nama_dokter : 'Dokter';
    const patientName = patient.length > 0 ? patient[0].nama_pasien : 'Pasien';

    const [messages] = await pool.query(
      `SELECT 
        id_konsultasi as id,
        teks_pesan as message,
        pengirim as sender,
        IF(pengirim = 'Pasien', ?, ?) as sender_name,
        status_pesan as status,
        waktu_kirim as created_at,
        waktu_dibaca as read_at
       FROM konsultasi_online
       WHERE id_dokter = ? AND NIK_pasien = ?
       ORDER BY waktu_kirim ASC`,
      [patientName, doctorName, doctorId, patient_id]
    );

    // Mark patient messages as read
    await pool.query(
      `UPDATE konsultasi_online 
       SET status_pesan = 'Terbaca', waktu_dibaca = NOW() 
       WHERE id_dokter = ? AND NIK_pasien = ? AND pengirim = 'Pasien' AND status_pesan != 'Terbaca'`,
      [doctorId, patient_id]
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get consultation messages error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const sendDoctorConsultationMessage = async (req, res) => {
  try {
    const { patient_id, message } = req.body;
    const doctorId = req.user.id;

    // Get patient name
    const [patient] = await pool.query(
      'SELECT nama_pasien FROM pasien WHERE NIK_pasien = ?',
      [patient_id]
    );

    if (patient.length === 0) {
      return res.status(404).json({ message: 'Data pasien tidak ditemukan' });
    }

    const [result] = await pool.query(
      `INSERT INTO konsultasi_online 
       (NIK_pasien, nama_pasien, id_dokter, teks_pesan, status_pesan, pengirim)
       VALUES (?, ?, ?, ?, 'Terkirim', 'Dokter')`,
      [patient_id, patient[0].nama_pasien, doctorId, message]
    );

    res.status(201).json({
      message: 'Pesan Anda telah dikirim',
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Send doctor consultation message error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};
