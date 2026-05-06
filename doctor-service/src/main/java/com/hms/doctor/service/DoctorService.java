package com.hms.doctor.service;

import com.hms.doctor.dto.DoctorRequest;
import com.hms.doctor.dto.MedicalHistoryRequest;
import com.hms.doctor.entity.Doctor;
import com.hms.doctor.entity.MedicalHistory;
import com.hms.doctor.repository.DoctorRepository;
import com.hms.doctor.repository.MedicalHistoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final MedicalHistoryRepository medicalHistoryRepository;

    public DoctorService(DoctorRepository doctorRepository, MedicalHistoryRepository medicalHistoryRepository) {
        this.doctorRepository = doctorRepository;
        this.medicalHistoryRepository = medicalHistoryRepository;
    }

    public Doctor addDoctor(DoctorRequest request) {
        Doctor doctor = new Doctor();
        doctor.setUserId(request.getUserId());
        doctor.setName(request.getName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setPhone(request.getPhone());
        doctor.setEmail(request.getEmail());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setIsApproved(false);
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with userId: " + userId));
    }

    public Doctor approveDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        doctor.setIsApproved(true);
        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
    }

    public MedicalHistory addMedicalHistory(MedicalHistoryRequest request, Long doctorId) {
        MedicalHistory history = new MedicalHistory();
        history.setPatientId(request.getPatientId());
        history.setDoctorId(doctorId);
        history.setDiagnosis(request.getDiagnosis());
        history.setTreatment(request.getTreatment());
        history.setNotes(request.getNotes());
        return medicalHistoryRepository.save(history);
    }

    public List<MedicalHistory> getPatientMedicalHistory(Long patientId) {
        return medicalHistoryRepository.findByPatientId(patientId);
    }

    public MedicalHistory updateMedicalHistory(Long id, MedicalHistoryRequest request, Long doctorId) {
        MedicalHistory history = medicalHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical history not found with id: " + id));

        if (!history.getDoctorId().equals(doctorId)) {
            throw new RuntimeException("Unauthorized: Only the doctor who created this record can update it");
        }

        history.setDiagnosis(request.getDiagnosis());
        history.setTreatment(request.getTreatment());
        history.setNotes(request.getNotes());
        history.setUpdatedAt(LocalDateTime.now());
        return medicalHistoryRepository.save(history);
    }
}

