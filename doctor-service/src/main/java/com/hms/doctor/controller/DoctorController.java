package com.hms.doctor.controller;

import com.hms.doctor.dto.DoctorRequest;
import com.hms.doctor.dto.MedicalHistoryRequest;
import com.hms.doctor.entity.Doctor;
import com.hms.doctor.entity.MedicalHistory;
import com.hms.doctor.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PostMapping
    public ResponseEntity<Doctor> addDoctor(@RequestBody DoctorRequest request) {
        return ResponseEntity.ok(doctorService.addDoctor(request));
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<Doctor> getDoctorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(doctorService.getDoctorByUserId(userId));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Doctor> approveDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.approveDoctor(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok("Doctor deleted successfully");
    }

    @PostMapping("/medical-history")
    public ResponseEntity<MedicalHistory> addMedicalHistory(
            @RequestBody MedicalHistoryRequest request,
            @RequestHeader("X-User-Id") Long doctorId) {
        return ResponseEntity.ok(doctorService.addMedicalHistory(request, doctorId));
    }

    @GetMapping("/medical-history/patient/{patientId}")
    public ResponseEntity<List<MedicalHistory>> getPatientMedicalHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(doctorService.getPatientMedicalHistory(patientId));
    }

    @PutMapping("/medical-history/{id}")
    public ResponseEntity<MedicalHistory> updateMedicalHistory(
            @PathVariable Long id,
            @RequestBody MedicalHistoryRequest request,
            @RequestHeader("X-User-Id") Long doctorId) {
        return ResponseEntity.ok(doctorService.updateMedicalHistory(id, request, doctorId));
    }
}

