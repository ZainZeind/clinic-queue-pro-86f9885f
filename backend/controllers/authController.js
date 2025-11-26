import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import { validatePhone, validateNIK, validateEmail, validatePassword } from '../utils/validation.js';

export const register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      full_name, 
      role = 'pasien', 
      phone, 
      address, 
      date_of_birth, 
      gender,
      nik, // NIK untuk pasien
      specialization, // Spesialisasi untuk dokter
      sip // No. SIP untuk dokter
    } = req.body;

    // Validate phone number if provided
    if (phone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
    }

    // Validate NIK for pasien
    if (role === 'pasien' && nik) {
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
      // Check existing admin
      const [existingAdmin] = await pool.query(
        'SELECT id_admin FROM admin WHERE email = ?',
        [email]
      );

      if (existingAdmin.length > 0) {
        return res.status(400).json({ message: 'Email sudah terdaftar' });
      }

      const [result] = await pool.query(
        'INSERT INTO admin (nama_admin, email, password) VALUES (?, ?, ?)',
        [full_name, email, hashedPassword]
      );

      const token = jwt.sign(
        { id: result.insertId, email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Akun Anda telah berhasil dibuat',
        token,
        user: { id: result.insertId, email, role: 'admin', full_name }
      });

    } else if (role === 'dokter') {
      // Check existing dokter
      const [existingDokter] = await pool.query(
        'SELECT id_dokter FROM dokter WHERE email = ?',
        [email]
      );

      if (existingDokter.length > 0) {
        return res.status(400).json({ message: 'Email sudah terdaftar' });
      }

      const [result] = await pool.query(
        'INSERT INTO dokter (nama_dokter, spesialisasi, no_sip, no_hp, email, password, status_aktif) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [full_name, specialization || 'Umum', sip || `SIP-${Date.now()}`, phone || '', email, hashedPassword, 'Aktif']
      );

      const token = jwt.sign(
        { id: result.insertId, email, role: 'dokter' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Akun Anda telah berhasil dibuat',
        token,
        user: { id: result.insertId, email, role: 'dokter', full_name, specialization }
      });

    } else { // pasien
      // Check existing pasien by NIK or email
      const [existingPasien] = await pool.query(
        'SELECT NIK_pasien FROM pasien WHERE NIK_pasien = ? OR email = ?',
        [nik, email]
      );

      if (existingPasien.length > 0) {
        return res.status(400).json({ message: 'NIK atau Email sudah terdaftar' });
      }

      if (!nik) {
        return res.status(400).json({ message: 'NIK wajib diisi untuk pasien' });
      }

      const [result] = await pool.query(
        'INSERT INTO pasien (NIK_pasien, nama_pasien, tanggal_lahir, alamat, no_hp, email, jenis_kelamin, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nik, full_name, date_of_birth || '2000-01-01', address || '', phone || '', email || null, gender || 'Laki-laki', hashedPassword]
      );

      const token = jwt.sign(
        { id: nik, email, role: 'pasien' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Akun Anda telah berhasil dibuat',
        token,
        user: { id: nik, email, role: 'pasien', full_name }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = null;
    let role = null;

    // Try login as admin
    const [admins] = await pool.query(
      'SELECT id_admin as id, nama_admin as full_name, email, password FROM admin WHERE email = ?',
      [email]
    );

    if (admins.length > 0) {
      user = admins[0];
      role = 'admin';
    }

    // Try login as dokter
    if (!user) {
      const [dokters] = await pool.query(
        'SELECT id_dokter as id, nama_dokter as full_name, email, password, spesialisasi FROM dokter WHERE email = ?',
        [email]
      );

      if (dokters.length > 0) {
        user = dokters[0];
        role = 'dokter';
      }
    }

    // Try login as pasien
    if (!user) {
      const [pasiens] = await pool.query(
        'SELECT NIK_pasien as id, nama_pasien as full_name, email, password FROM pasien WHERE email = ?',
        [email]
      );

      if (pasiens.length > 0) {
        user = pasiens[0];
        role = 'pasien';
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Selamat datang! Login berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        role,
        full_name: user.full_name,
        specialization: user.spesialisasi || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    let user = null;

    if (role === 'admin') {
      const [admins] = await pool.query(
        'SELECT id_admin as id, nama_admin as full_name, email, created_at FROM admin WHERE id_admin = ?',
        [userId]
      );
      if (admins.length > 0) {
        user = { ...admins[0], role: 'admin' };
      }
    } else if (role === 'dokter') {
      const [dokters] = await pool.query(
        'SELECT id_dokter as id, nama_dokter as full_name, email, no_hp as phone, spesialisasi, no_sip, status_aktif, jadwal_praktik, created_at FROM dokter WHERE id_dokter = ?',
        [userId]
      );
      if (dokters.length > 0) {
        user = { ...dokters[0], role: 'dokter' };
      }
    } else if (role === 'pasien') {
      const [pasiens] = await pool.query(
        'SELECT NIK_pasien as id, nama_pasien as full_name, email, no_hp as phone, alamat as address, tanggal_lahir as date_of_birth, jenis_kelamin as gender, golongan_darah, created_at FROM pasien WHERE NIK_pasien = ?',
        [userId]
      );
      if (pasiens.length > 0) {
        user = { ...pasiens[0], role: 'pasien' };
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { full_name, email, phone, address, specialization } = req.body;

    // Validate phone number if provided
    if (phone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
    }

    if (role === 'admin') {
      // Check if email is already taken
      if (email) {
        const [existingAdmins] = await pool.query(
          'SELECT id_admin FROM admin WHERE email = ? AND id_admin != ?',
          [email, userId]
        );

        if (existingAdmins.length > 0) {
          return res.status(400).json({ message: 'Email sudah digunakan oleh user lain' });
        }
      }

      const updateFields = [];
      const updateValues = [];

      if (full_name) {
        updateFields.push('nama_admin = ?');
        updateValues.push(full_name);
      }
      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }

      if (updateFields.length > 0) {
        updateValues.push(userId);
        await pool.query(
          `UPDATE admin SET ${updateFields.join(', ')} WHERE id_admin = ?`,
          updateValues
        );
      }

    } else if (role === 'dokter') {
      // Check if email is already taken
      if (email) {
        const [existingDokters] = await pool.query(
          'SELECT id_dokter FROM dokter WHERE email = ? AND id_dokter != ?',
          [email, userId]
        );

        if (existingDokters.length > 0) {
          return res.status(400).json({ message: 'Email sudah digunakan oleh user lain' });
        }
      }

      const updateFields = [];
      const updateValues = [];

      if (full_name) {
        updateFields.push('nama_dokter = ?');
        updateValues.push(full_name);
      }
      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (phone) {
        updateFields.push('no_hp = ?');
        updateValues.push(phone);
      }
      if (specialization) {
        updateFields.push('spesialisasi = ?');
        updateValues.push(specialization);
      }

      if (updateFields.length > 0) {
        updateValues.push(userId);
        await pool.query(
          `UPDATE dokter SET ${updateFields.join(', ')} WHERE id_dokter = ?`,
          updateValues
        );
      }

    } else if (role === 'pasien') {
      // Check if email is already taken
      if (email) {
        const [existingPasiens] = await pool.query(
          'SELECT NIK_pasien FROM pasien WHERE email = ? AND NIK_pasien != ?',
          [email, userId]
        );

        if (existingPasiens.length > 0) {
          return res.status(400).json({ message: 'Email sudah digunakan oleh user lain' });
        }
      }

      const updateFields = [];
      const updateValues = [];

      if (full_name) {
        updateFields.push('nama_pasien = ?');
        updateValues.push(full_name);
      }
      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (phone) {
        updateFields.push('no_hp = ?');
        updateValues.push(phone);
      }
      if (address) {
        updateFields.push('alamat = ?');
        updateValues.push(address);
      }

      if (updateFields.length > 0) {
        updateValues.push(userId);
        await pool.query(
          `UPDATE pasien SET ${updateFields.join(', ')} WHERE NIK_pasien = ?`,
          updateValues
        );
      }
    }

    // Get updated user data
    let updatedUser = null;
    if (role === 'admin') {
      const [admins] = await pool.query(
        'SELECT id_admin as id, nama_admin as full_name, email, created_at FROM admin WHERE id_admin = ?',
        [userId]
      );
      if (admins.length > 0) {
        updatedUser = { ...admins[0], role: 'admin' };
      }
    } else if (role === 'dokter') {
      const [dokters] = await pool.query(
        'SELECT id_dokter as id, nama_dokter as full_name, email, no_hp as phone, spesialisasi, no_sip, status_aktif, jadwal_praktik, created_at FROM dokter WHERE id_dokter = ?',
        [userId]
      );
      if (dokters.length > 0) {
        updatedUser = { ...dokters[0], role: 'dokter' };
      }
    } else if (role === 'pasien') {
      const [pasiens] = await pool.query(
        'SELECT NIK_pasien as id, nama_pasien as full_name, email, no_hp as phone, alamat as address, tanggal_lahir as date_of_birth, jenis_kelamin as gender, golongan_darah, created_at FROM pasien WHERE NIK_pasien = ?',
        [userId]
      );
      if (pasiens.length > 0) {
        updatedUser = { ...pasiens[0], role: 'pasien' };
      }
    }

    res.json({ 
      message: 'Profil Anda telah diperbarui',
      user: updatedUser 
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Password lama dan baru harus diisi' });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    let currentPassword = null;
    let tableName = '';
    let idField = '';

    // Get current password based on role
    if (role === 'admin') {
      const [admins] = await pool.query(
        'SELECT password FROM admin WHERE id_admin = ?',
        [userId]
      );
      if (admins.length > 0) {
        currentPassword = admins[0].password;
        tableName = 'admin';
        idField = 'id_admin';
      }
    } else if (role === 'dokter') {
      const [dokters] = await pool.query(
        'SELECT password FROM dokter WHERE id_dokter = ?',
        [userId]
      );
      if (dokters.length > 0) {
        currentPassword = dokters[0].password;
        tableName = 'dokter';
        idField = 'id_dokter';
      }
    } else if (role === 'pasien') {
      const [pasiens] = await pool.query(
        'SELECT password FROM pasien WHERE NIK_pasien = ?',
        [userId]
      );
      if (pasiens.length > 0) {
        currentPassword = pasiens[0].password;
        tableName = 'pasien';
        idField = 'NIK_pasien';
      }
    }

    if (!currentPassword) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, currentPassword);
    
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Password lama tidak sesuai' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      `UPDATE ${tableName} SET password = ? WHERE ${idField} = ?`,
      [hashedPassword, userId]
    );

    res.json({ message: 'Password Anda telah diperbarui' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan, silakan coba lagi' });
  }
};
