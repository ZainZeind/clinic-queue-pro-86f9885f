// Validation utility functions

export const validatePhone = (phone) => {
  if (!phone) return { valid: true }; // Phone is optional in some cases
  
  // Remove any whitespace
  const cleanPhone = phone.toString().trim();
  
  // Check if it's only numbers
  const phoneRegex = /^[0-9]+$/;
  if (!phoneRegex.test(cleanPhone)) {
    return {
      valid: false,
      message: 'Nomor telepon hanya boleh berisi angka'
    };
  }
  
  // Check length (max 13 digits)
  if (cleanPhone.length > 13) {
    return {
      valid: false,
      message: 'Nomor telepon maksimal 13 digit'
    };
  }
  
  // Check minimum length (at least 10 digits for Indonesian phone numbers)
  if (cleanPhone.length < 10) {
    return {
      valid: false,
      message: 'Nomor telepon minimal 10 digit'
    };
  }
  
  return {
    valid: true,
    cleanPhone
  };
};

export const validateNIK = (nik) => {
  if (!nik) return { valid: false, message: 'NIK wajib diisi' };
  
  const cleanNIK = nik.toString().trim();
  
  // NIK must be exactly 16 digits
  if (!/^[0-9]{16}$/.test(cleanNIK)) {
    return {
      valid: false,
      message: 'NIK harus 16 digit angka'
    };
  }
  
  return {
    valid: true,
    cleanNIK
  };
};

export const validateEmail = (email) => {
  if (!email) return { valid: false, message: 'Email wajib diisi' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: 'Format email tidak valid'
    };
  }
  
  return { valid: true };
};

export const validatePassword = (password, isUpdate = false) => {
  // For update, password is optional
  if (!password && isUpdate) return { valid: true };
  
  if (!password) return { valid: false, message: 'Password wajib diisi' };
  
  // Minimal 8 karakter
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password minimal 8 karakter'
    };
  }
  
  // Harus mengandung huruf
  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password harus mengandung huruf'
    };
  }
  
  // Harus mengandung angka
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password harus mengandung angka'
    };
  }
  
  // Harus mengandung huruf besar dan kecil
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password harus mengandung huruf besar dan kecil'
    };
  }
  
  return { valid: true };
};
