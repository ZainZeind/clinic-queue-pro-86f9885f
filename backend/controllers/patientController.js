import pool from '../config/database.js';

// ==========================================
// DOCTORS LIST
// ==========================================

export const getDoctors = async (req, res) => {
  try {
    const [doctors] = await pool.query(
      `SELECT 
        id_dokter as id, 
        nama_dokter as full_name, 
        spesialisasi,
        no_hp as phone,
        email,
        jadwal_praktik,
        status_aktif
       FROM dokter
       WHERE status_aktif = 'Aktif'
       ORDER BY nama_dokter ASC`
    );

    // Parse jadwal_praktik for each doctor
    const doctorsWithSchedule = doctors.map(doc => {
      try {
        doc.schedules = doc.jadwal_praktik ? JSON.parse(doc.jadwal_praktik) : {};
      } catch (e) {
        doc.schedules = {};
      }
      return doc;
    });

    res.json({ doctors: doctorsWithSchedule });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const getDoctorSchedules = async (req, res) => {
  try {
    const { doctor_id } = req.params;

    const [dokter] = await pool.query(
      'SELECT nama_dokter as full_name, spesialisasi, jadwal_praktik FROM dokter WHERE id_dokter = ? AND status_aktif = "Aktif"',
      [doctor_id]
    );

    if (dokter.length === 0) {
      return res.status(404).json({ message: 'Dokter tidak ditemukan' });
    }

    let schedules = {};
    try {
      schedules = dokter[0].jadwal_praktik ? JSON.parse(dokter[0].jadwal_praktik) : {};
    } catch (e) {
      schedules = {};
    }

    res.json({ 
      doctor: dokter[0],
      schedules 
    });
  } catch (error) {
    console.error('Get doctor schedules error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

// ==========================================
// ONLINE REGISTRATION / APPOINTMENT
// ==========================================

export const createAppointment = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { doctor_id, appointment_date, appointment_time, complaint } = req.body;
    const patientNik = req.user.id; // NIK_pasien

    console.log('📝 [Appointment] Creating appointment:', { doctor_id, appointment_date, appointment_time });

    // Get patient info
    const [patient] = await connection.query(
      'SELECT nama_pasien FROM pasien WHERE NIK_pasien = ?',
      [patientNik]
    );

    if (patient.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Data pasien tidak ditemukan' });
    }

    const patientName = patient[0].nama_pasien;

    // Check if appointment already exists
    const [existing] = await connection.query(
      `SELECT id_pendaftaran FROM pendaftaran_online 
       WHERE NIK_pasien = ? AND id_dokter = ? AND tanggal_pendaftaran = ? 
       AND status_pendaftaran NOT IN ('Dibatalkan')`,
      [patientNik, doctor_id, appointment_date]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Anda sudah memiliki pendaftaran di tanggal ini' });
    }

    // Get doctor schedule and check capacity
    const [doctor] = await connection.query(
      'SELECT jadwal_praktik FROM dokter WHERE id_dokter = ?',
      [doctor_id]
    );

    if (doctor.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Dokter tidak ditemukan' });
    }

    // Parse schedule
    let schedules = {};
    let maxPatients = 20; // default
    try {
      if (doctor[0].jadwal_praktik) {
        schedules = JSON.parse(doctor[0].jadwal_praktik);
      }
    } catch (e) {
      console.error('Parse schedule error:', e);
    }

    // Get day name from appointment_date
    const appointmentDay = new Date(appointment_date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' });
    const dayMap = {
      'Senin': 'senin',
      'Selasa': 'selasa',
      'Rabu': 'rabu',
      'Kamis': 'kamis',
      'Jumat': 'jumat',
      'Sabtu': 'sabtu',
      'Minggu': 'minggu'
    };
    const scheduleKey = dayMap[appointmentDay];

    console.log('📅 [Appointment] Day:', appointmentDay, 'Schedule key:', scheduleKey);

    // Check if doctor has schedule for this day
    if (!schedules[scheduleKey]) {
      await connection.rollback();
      return res.status(400).json({ message: `Dokter tidak praktik di hari ${appointmentDay}` });
    }

    // Check time slot
    const scheduleTime = schedules[scheduleKey]; // e.g., "08:00-14:00"
    const [startTime, endTime] = scheduleTime.split('-');
    
    // Validate appointment_time is within schedule
    if (appointment_time < startTime || appointment_time > endTime) {
      await connection.rollback();
      return res.status(400).json({ 
        message: `Waktu yang dipilih di luar jadwal praktik. Jadwal dokter: ${startTime} - ${endTime}` 
      });
    }

    // Check current capacity for this time slot (1 hour window)
    const timeSlotEnd = String(parseInt(appointment_time.split(':')[0]) + 1).padStart(2, '0') + ':00';
    
    const [currentBookings] = await connection.query(
      `SELECT COUNT(*) as count 
       FROM pendaftaran_online po
       WHERE po.id_dokter = ? 
       AND po.tanggal_pendaftaran = ?
       AND po.waktu_daftar >= ?
       AND po.waktu_daftar < ?
       AND po.status_pendaftaran NOT IN ('Dibatalkan')`,
      [doctor_id, appointment_date, appointment_time, timeSlotEnd]
    );

    const currentCount = currentBookings[0].count;
    console.log('📊 [Appointment] Current bookings:', currentCount, '/', maxPatients);

    if (currentCount >= maxPatients) {
      await connection.rollback();
      return res.status(400).json({ 
        message: `Maaf, slot waktu ${appointment_time} sudah penuh (${currentCount}/${maxPatients} pasien). Silakan pilih waktu lain.` 
      });
    }

    // Create appointment/registration
    const [appointmentResult] = await connection.query(
      `INSERT INTO pendaftaran_online 
       (NIK_pasien, nama_pasien, id_dokter, tanggal_pendaftaran, waktu_daftar, keluhan_pasien, jenis_layanan, status_pendaftaran)
       VALUES (?, ?, ?, ?, ?, ?, 'Konsultasi Umum', 'Dikonfirmasi')`,
      [patientNik, patientName, doctor_id, appointment_date, appointment_time, complaint]
    );

    const appointmentId = appointmentResult.insertId;

    // Generate queue number
    const [queueCount] = await connection.query(
      'SELECT COALESCE(MAX(nomor_antrian), 0) + 1 as next_number FROM nomor_antrian WHERE tanggal_antrian = ?',
      [appointment_date]
    );

    const queueNumber = queueCount[0].next_number;

    // Create queue
    await connection.query(
      `INSERT INTO nomor_antrian 
       (nomor_antrian, id_pendaftaran, NIK_pasien, nama_pasien, id_dokter, tanggal_antrian, status_antrian, prioritas)
       VALUES (?, ?, ?, ?, ?, ?, 'Menunggu', 'Normal')`,
      [queueNumber, appointmentId, patientNik, patientName, doctor_id, appointment_date]
    );

    // Create notification
    await connection.query(
      `INSERT INTO notifikasi (NIK_pasien, judul_notifikasi, isi_notifikasi, jenis_notifikasi, status_antrian)
       VALUES (?, 'Pendaftaran Berhasil', ?, 'Pendaftaran', 'Menunggu')`,
      [patientNik, `Nomor antrian Anda: ${queueNumber}. Tanggal: ${appointment_date}, Waktu: ${appointment_time}`]
    );

    await connection.commit();

    console.log('✅ [Appointment] Appointment created successfully:', appointmentId);

    res.status(201).json({
      message: 'Pendaftaran Anda telah dikonfirmasi',
      appointmentId,
      queueNumber,
      availableSlots: maxPatients - currentCount - 1
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ [Appointment] Create appointment error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  } finally {
    connection.release();
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const patientNik = req.user.id;

    const [appointments] = await pool.query(
      `SELECT 
        po.id_pendaftaran as id,
        po.tanggal_pendaftaran as appointment_date,
        po.waktu_daftar as appointment_time,
        po.keluhan_pasien as complaint,
        po.jenis_layanan as service_type,
        po.status_pendaftaran as status,
        d.nama_dokter as doctor_name,
        d.spesialisasi,
        na.nomor_antrian as queue_number,
        na.status_antrian as queue_status,
        po.created_at
       FROM pendaftaran_online po
       LEFT JOIN dokter d ON po.id_dokter = d.id_dokter
       LEFT JOIN nomor_antrian na ON po.id_pendaftaran = na.id_pendaftaran
       WHERE po.NIK_pasien = ?
       ORDER BY po.tanggal_pendaftaran DESC`,
      [patientNik]
    );

    res.json({ appointments });
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const getQueueStatus = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const patientNik = req.user.id;

    const [queue] = await pool.query(
      `SELECT 
        na.id_antrian,
        na.nomor_antrian,
        na.tanggal_antrian as queue_date,
        na.status_antrian as status,
        na.waktu_mulai as called_at,
        na.waktu_selesai as completed_at,
        d.nama_dokter as doctor_name,
        d.spesialisasi,
        po.keluhan_pasien as complaint
       FROM nomor_antrian na
       LEFT JOIN pendaftaran_online po ON na.id_pendaftaran = po.id_pendaftaran
       LEFT JOIN dokter d ON na.id_dokter = d.id_dokter
       WHERE na.id_pendaftaran = ? AND na.NIK_pasien = ?`,
      [appointment_id, patientNik]
    );

    if (queue.length === 0) {
      return res.status(404).json({ message: 'Antrian tidak ditemukan' });
    }

    // Get current queue being served
    const [currentQueue] = await pool.query(
      `SELECT nomor_antrian FROM nomor_antrian 
       WHERE tanggal_antrian = ? AND status_antrian IN ('Dipanggil', 'Sedang Dilayani')
       ORDER BY nomor_antrian ASC LIMIT 1`,
      [queue[0].queue_date]
    );

    res.json({
      queue: queue[0],
      currentQueueNumber: currentQueue.length > 0 ? currentQueue[0].nomor_antrian : 0
    });
  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

// ==========================================
// ONLINE CONSULTATION
// ==========================================

export const createConsultation = async (req, res) => {
  try {
    const { doctor_id, message } = req.body;
    const patientNik = req.user.id;

    // Get patient name
    const [patient] = await pool.query(
      'SELECT nama_pasien FROM pasien WHERE NIK_pasien = ?',
      [patientNik]
    );

    if (patient.length === 0) {
      return res.status(404).json({ message: 'Data pasien tidak ditemukan' });
    }

    const [result] = await pool.query(
      `INSERT INTO konsultasi_online 
       (NIK_pasien, nama_pasien, id_dokter, teks_pesan, status_pesan, pengirim)
       VALUES (?, ?, ?, ?, 'Terkirim', 'Pasien')`,
      [patientNik, patient[0].nama_pasien, doctor_id, message]
    );

    res.status(201).json({
      message: 'Pesan Anda telah dikirim',
      consultationId: result.insertId
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const getMyConsultations = async (req, res) => {
  try {
    const patientNik = req.user.id;

    // Get unique consultations grouped by doctor
    const [consultations] = await pool.query(
      `SELECT 
        ko.id_dokter as doctor_id,
        d.nama_dokter as doctor_name,
        d.spesialisasi,
        MAX(ko.waktu_kirim) as last_message_at,
        COUNT(*) as message_count,
        'chat' as consultation_type,
        'active' as status,
        (SELECT teks_pesan FROM konsultasi_online 
         WHERE NIK_pasien = ? AND id_dokter = ko.id_dokter 
         ORDER BY waktu_kirim DESC LIMIT 1) as notes
       FROM konsultasi_online ko
       LEFT JOIN dokter d ON ko.id_dokter = d.id_dokter
       WHERE ko.NIK_pasien = ?
       GROUP BY ko.id_dokter, d.nama_dokter, d.spesialisasi
       ORDER BY last_message_at DESC`,
      [patientNik, patientNik]
    );

    res.json({ consultations });
  } catch (error) {
    console.error('Get my consultations error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const sendConsultationMessage = async (req, res) => {
  try {
    const { doctor_id, message } = req.body;
    const patientNik = req.user.id;

    // Get patient name
    const [patient] = await pool.query(
      'SELECT nama_pasien FROM pasien WHERE NIK_pasien = ?',
      [patientNik]
    );

    if (patient.length === 0) {
      return res.status(404).json({ message: 'Data pasien tidak ditemukan' });
    }

    const [result] = await pool.query(
      `INSERT INTO konsultasi_online 
       (NIK_pasien, nama_pasien, id_dokter, teks_pesan, status_pesan, pengirim)
       VALUES (?, ?, ?, ?, 'Terkirim', 'Pasien')`,
      [patientNik, patient[0].nama_pasien, doctor_id, message]
    );

    res.status(201).json({
      message: 'Pesan Anda telah dikirim',
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Send consultation message error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const getConsultationMessages = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const patientNik = req.user.id;

    // Get patient name
    const [patient] = await pool.query(
      'SELECT nama_pasien FROM pasien WHERE NIK_pasien = ?',
      [patientNik]
    );

    // Get doctor name
    const [doctor] = await pool.query(
      'SELECT nama_dokter FROM dokter WHERE id_dokter = ?',
      [doctor_id]
    );

    const patientName = patient.length > 0 ? patient[0].nama_pasien : 'Pasien';
    const doctorName = doctor.length > 0 ? doctor[0].nama_dokter : 'Dokter';

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
       WHERE NIK_pasien = ? AND id_dokter = ?
       ORDER BY waktu_kirim ASC`,
      [patientName, doctorName, patientNik, doctor_id]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE konsultasi_online 
       SET status_pesan = 'Terbaca', waktu_dibaca = NOW() 
       WHERE NIK_pasien = ? AND id_dokter = ? AND pengirim = 'Dokter' AND status_pesan != 'Terbaca'`,
      [patientNik, doctor_id]
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get consultation messages error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

// ==========================================
// TIME SLOTS AVAILABILITY
// ==========================================

// Get available time slots for a doctor on a specific date
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Tanggal harus diisi' });
    }

    console.log('🕐 [TimeSlots] Getting slots for doctor:', doctor_id, 'date:', date);

    // Get doctor schedule
    const [doctor] = await pool.query(
      'SELECT jadwal_praktik FROM dokter WHERE id_dokter = ? AND status_aktif = "Aktif"',
      [doctor_id]
    );

    if (doctor.length === 0) {
      return res.status(404).json({ message: 'Dokter tidak ditemukan' });
    }

    let schedules = {};
    const maxPatients = 20; // default per slot
    
    try {
      schedules = doctor[0].jadwal_praktik ? JSON.parse(doctor[0].jadwal_praktik) : {};
    } catch (e) {
      console.error('Parse schedule error:', e);
      return res.status(500).json({ message: 'Error parsing schedule' });
    }

    // Get day name
    const appointmentDay = new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' });
    const dayMap = {
      'Senin': 'senin',
      'Selasa': 'selasa',
      'Rabu': 'rabu',
      'Kamis': 'kamis',
      'Jumat': 'jumat',
      'Sabtu': 'sabtu',
      'Minggu': 'minggu'
    };
    const scheduleKey = dayMap[appointmentDay];

    if (!schedules[scheduleKey]) {
      return res.json({ 
        slots: [],
        message: `Dokter tidak praktik di hari ${appointmentDay}` 
      });
    }

    // Parse time range
    const scheduleTime = schedules[scheduleKey];
    const [startTime, endTime] = scheduleTime.split('-');
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);

    // Generate time slots (1 hour intervals)
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const slotTime = String(hour).padStart(2, '0') + ':00';
      const slotEndTime = String(hour + 1).padStart(2, '0') + ':00';

      // Check current bookings for this slot
      const [bookings] = await pool.query(
        `SELECT COUNT(*) as count 
         FROM pendaftaran_online 
         WHERE id_dokter = ? 
         AND tanggal_pendaftaran = ?
         AND waktu_daftar >= ?
         AND waktu_daftar < ?
         AND status_pendaftaran NOT IN ('Dibatalkan')`,
        [doctor_id, date, slotTime, slotEndTime]
      );

      const currentCount = bookings[0].count;
      const available = maxPatients - currentCount;

      slots.push({
        time: slotTime,
        displayTime: `${slotTime} - ${slotEndTime}`,
        maxCapacity: maxPatients,
        currentBookings: currentCount,
        availableSlots: available,
        isFull: currentCount >= maxPatients
      });
    }

    console.log('✅ [TimeSlots] Generated', slots.length, 'slots');

    res.json({ 
      slots,
      scheduleTime: `${startTime} - ${endTime}`,
      day: appointmentDay
    });
  } catch (error) {
    console.error('❌ [TimeSlots] Get available time slots error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};
