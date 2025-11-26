const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: this.getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  // Auth
  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    phone?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData: {
    full_name?: string;
    email?: string;
    phone?: string;
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: {
    oldPassword: string;
    newPassword: string;
  }) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Doctor - Schedules
  async getDoctorSchedules(doctorId?: number) {
    const endpoint = doctorId
      ? `/doctor/schedules/${doctorId}`
      : '/doctor/schedules';
    return this.request(endpoint);
  }

  async createSchedule(scheduleData: any) {
    return this.request('/doctor/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  async updateSchedule(id: number, scheduleData: any) {
    return this.request(`/doctor/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  }

  async deleteSchedule(id: number) {
    return this.request(`/doctor/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // Doctor - Medical Records
  async createMedicalRecord(recordData: any) {
    return this.request('/doctor/medical-records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  }

  async getMedicalRecords(patientId: number) {
    return this.request(`/doctor/medical-records/${patientId}`);
  }

  async updateMedicalRecord(id: number, recordData: any) {
    return this.request(`/doctor/medical-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData),
    });
  }

  async getTodayPatients() {
    return this.request('/doctor/today-patients');
  }

  // Doctor - Consultations
  async getDoctorConsultations() {
    return this.request('/doctor/consultations');
  }

  async getDoctorConsultationMessages(patientId: string) {
    return this.request(`/doctor/consultations/${patientId}/messages`);
  }

  async sendDoctorConsultationMessage(patientId: string, message: string) {
    return this.request('/doctor/consultations/messages', {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId, message }),
    });
  }

  // Patient - Appointments
  async getDoctors() {
    return this.request('/patient/doctors');
  }

  async getDoctorSchedulesByDoctor(doctorId: number) {
    return this.request(`/patient/doctors/${doctorId}/schedules`);
  }

  async getAvailableTimeSlots(doctorId: number, date: string) {
    return this.request(`/patient/doctors/${doctorId}/timeslots?date=${date}`);
  }

  async createAppointment(appointmentData: any) {
    return this.request('/patient/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getMyAppointments() {
    return this.request('/patient/appointments');
  }

  async getQueueStatus(appointmentId: number) {
    return this.request(`/patient/queue/${appointmentId}`);
  }

  // Patient - Consultations
  async createConsultation(consultationData: any) {
    return this.request('/patient/consultations', {
      method: 'POST',
      body: JSON.stringify(consultationData),
    });
  }

  async getMyConsultations() {
    return this.request('/patient/consultations');
  }

  async sendConsultationMessage(doctorId: number, message: string) {
    return this.request('/patient/consultations/messages', {
      method: 'POST',
      body: JSON.stringify({ doctor_id: doctorId, message }),
    });
  }

  async getConsultationMessages(consultationId: number) {
    return this.request(`/patient/consultations/${consultationId}/messages`);
  }

  // Admin - Queue
  async getTodayQueue() {
    return this.request('/admin/queue/today');
  }

  async callQueue(queueId: number) {
    return this.request('/admin/queue/call', {
      method: 'POST',
      body: JSON.stringify({ queue_id: queueId }),
    });
  }

  async completeQueue(queueId: number) {
    return this.request('/admin/queue/complete', {
      method: 'POST',
      body: JSON.stringify({ queue_id: queueId }),
    });
  }

  async skipQueue(queueId: number) {
    return this.request('/admin/queue/skip', {
      method: 'POST',
      body: JSON.stringify({ queue_id: queueId }),
    });
  }

  // Admin - Users
  async getAllUsers(role?: string) {
    const endpoint = role ? `/admin/users?role=${role}` : '/admin/users';
    return this.request(endpoint);
  }

  async createUser(userData: any) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: any) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number, role: string) {
    return this.request(`/admin/users/${id}?role=${role}`, {
      method: 'DELETE',
    });
  }

  // Admin - Patients
  async getAllPatients() {
    return this.request('/admin/patients');
  }

  async getPatientDetail(id: number) {
    return this.request(`/admin/patients/${id}`);
  }

  // Admin - Notifications
  async createNotification(notificationData: any) {
    return this.request('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async sendBulkNotification(role: string, title: string, message: string, type?: string) {
    return this.request('/admin/notifications/bulk', {
      method: 'POST',
      body: JSON.stringify({ role, title, message, type }),
    });
  }

  // Admin - Dashboard
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }
}

export const api = new ApiService();
