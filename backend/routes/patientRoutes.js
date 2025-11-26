import express from 'express';
import {
  getDoctors,
  getDoctorSchedules,
  createAppointment,
  getMyAppointments,
  getQueueStatus,
  createConsultation,
  getMyConsultations,
  sendConsultationMessage,
  getConsultationMessages,
  getAvailableTimeSlots
} from '../controllers/patientController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Appointments
router.get('/doctors', getDoctors);
router.get('/doctors/:doctor_id/schedules', getDoctorSchedules);
router.get('/doctors/:doctor_id/timeslots', getAvailableTimeSlots);
router.post('/appointments', authorizeRole('pasien', 'admin'), createAppointment);
router.get('/appointments', getMyAppointments);
router.get('/queue/:appointment_id', getQueueStatus);

// Consultations
router.post('/consultations', authorizeRole('pasien', 'admin'), createConsultation);
router.get('/consultations', getMyConsultations);
router.post('/consultations/messages', sendConsultationMessage);
router.get('/consultations/:consultation_id/messages', getConsultationMessages);

export default router;
