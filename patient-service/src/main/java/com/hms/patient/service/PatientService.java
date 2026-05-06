package com.hms.patient.service;

import com.hms.patient.dto.PatientRequest;
import com.hms.patient.entity.Patient;
import com.hms.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Patient createPatient(PatientRequest request) {
        Patient patient = new Patient();
        patient.setUserId(request.getUserId());
        patient.setName(request.getName());
        patient.setPhone(request.getPhone());
        patient.setGender(Patient.Gender.valueOf(request.getGender().toUpperCase()));
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());
        return patientRepository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
    }

    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient not found for user: " + userId));
    }

    public Patient updatePatient(Long id, PatientRequest request, Long userId) {
        Patient patient = getPatientById(id);

        if (!patient.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update your own profile");
        }

        patient.setName(request.getName());
        patient.setPhone(request.getPhone());
        patient.setGender(Patient.Gender.valueOf(request.getGender().toUpperCase()));
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAddress(request.getAddress());
        patient.setEmergencyContact(request.getEmergencyContact());
        return patientRepository.save(patient);
    }

    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new RuntimeException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }
}

