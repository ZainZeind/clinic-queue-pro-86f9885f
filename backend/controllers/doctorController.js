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
        schedules = Object.keys(jadwalObj).map(day => ({
          day_of_week: day,
          time: jadwalObj[day]
        }));
      }
    } catch (e) {
      schedules = [];
    }

    res.json({ schedules, raw: dokter[0].jadwal_praktik });
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
    const today = new Date().toISOString().split('T')[0];

    const [patients] = await pool.query(
      `SELECT 
        na.id_antrian,
        na.nomor_antrian,
        na.NIK_pasien,
        na.nama_pasien,
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
       WHERE na.id_dokter = ? AND na.tanggal_antrian = ?
       ORDER BY na.prioritas DESC, na.nomor_antrian ASC`,
      [doctorId, today]
    );

    res.json({ patients });
  } catch (error) {
    console.error('Get today patients error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};
