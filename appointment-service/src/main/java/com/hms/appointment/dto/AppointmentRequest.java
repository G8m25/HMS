package com.hms.appointment.dto;

import java.time.LocalDateTime;

public class AppointmentRequest {
    private Long doctorId;
    private LocalDateTime appDate;
    private String reason;

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public LocalDateTime getAppDate() { return appDate; }
    public void setAppDate(LocalDateTime appDate) { this.appDate = appDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
