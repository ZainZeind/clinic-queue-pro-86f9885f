import express from 'express';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createMedicalRecord,
  getMedicalRecords,
  updateMedicalRecord,
  getTodayPatients,
  getDoctorConsultations,
  getDoctorConsultationMessages,
  sendDoctorConsultationMessage
} from '../controllers/doctorController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and doctor role
router.use(authenticateToken);
router.use(authorizeRole('dokter', 'admin'));

// Schedules
router.get('/schedules', getSchedules);
router.get('/schedules/:doctorId', getSchedules);
router.post('/schedules', authorizeRole('dokter'), createSchedule);
router.put('/schedules/:id', authorizeRole('dokter'), updateSchedule);
router.delete('/schedules/:id', authorizeRole('dokter'), deleteSchedule);

// Medical Records
router.post('/medical-records', createMedicalRecord);
router.get('/medical-records/:patient_id', getMedicalRecords);
router.put('/medical-records/:id', updateMedicalRecord);

// Today Patients
router.get('/today-patients', getTodayPatients);

// Consultations
router.get('/consultations', getDoctorConsultations);
router.get('/consultations/:patient_id/messages', getDoctorConsultationMessages);
router.post('/consultations/messages', sendDoctorConsultationMessage);

export default router;
