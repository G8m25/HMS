package com.hms.appointment.service;

import com.hms.appointment.dto.AppointmentRequest;
import com.hms.appointment.entity.Appointment;
import com.hms.appointment.repository.AppointmentRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final RestTemplate restTemplate;

    public AppointmentService(AppointmentRepository appointmentRepository, RestTemplate restTemplate) {
        this.appointmentRepository = appointmentRepository;
        this.restTemplate = restTemplate;
    }

    public Appointment bookAppointment(AppointmentRequest request, Long patientId) {
        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setDoctorId(request.getDoctorId());
        appointment.setAppDate(request.getAppDate());
        appointment.setReason(request.getReason());
        appointment.setStatus(Appointment.Status.PENDING);
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getByDoctor(Long doctorUserId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Role", "DOCTOR");
        headers.set("X-User-Id", doctorUserId.toString());
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    "http://doctor-service/doctors/by-user/" + doctorUserId,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            Long doctorId = Long.valueOf(response.getBody().get("id").toString());
            return appointmentRepository.findByDoctorId(doctorId);
        } catch (Exception e) {
            return List.of();
        }
    }

    public Appointment updateStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        appointment.setStatus(Appointment.Status.valueOf(status.toUpperCase()));

        if (status.toUpperCase().equals("COMPLETED")) {
            generateInvoice(appointment);
        }

        return appointmentRepository.save(appointment);
    }

    public Appointment cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        appointment.setStatus(Appointment.Status.CANCELLED);
        return appointmentRepository.save(appointment);
    }

    private void generateInvoice(Appointment appointment) {
        try {
            HttpHeaders doctorHeaders = new HttpHeaders();
            doctorHeaders.set("X-User-Role", "DOCTOR");
            doctorHeaders.set("X-User-Id", appointment.getDoctorId().toString());
            HttpEntity<Void> doctorRequest = new HttpEntity<>(doctorHeaders);

            ResponseEntity<Map> doctorResponse = restTemplate.exchange(
                    "http://doctor-service/doctors/" + appointment.getDoctorId(),
                    HttpMethod.GET,
                    doctorRequest,
                    Map.class
            );

            BigDecimal consultationFee = new BigDecimal(doctorResponse.getBody().get("consultationFee").toString());
            BigDecimal tax = consultationFee.multiply(new BigDecimal("0.10"));

            Map<String, Object> invoiceRequest = new HashMap<>();
            invoiceRequest.put("appointmentId", appointment.getId());
            invoiceRequest.put("patientId", appointment.getPatientId());
            invoiceRequest.put("totalAmount", consultationFee);
            invoiceRequest.put("tax", tax);
            invoiceRequest.put("paymentMethod", "CARD");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-User-Role", "DOCTOR");
            headers.set("X-User-Id", appointment.getDoctorId().toString());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(invoiceRequest, headers);

            restTemplate.postForObject(
                    "http://billing-service/billing",
                    entity,
                    Object.class
            );
        } catch (Exception e) {
            System.err.println("Failed to generate invoice: " + e.getMessage());
        }
    }
}

