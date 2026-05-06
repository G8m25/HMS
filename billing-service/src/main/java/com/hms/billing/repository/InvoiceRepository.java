package com.hms.billing.repository;

import com.hms.billing.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByAppointmentId(Long appointmentId);
    List<Invoice> findByPatientId(Long patientId);
    List<Invoice> findByUserId(Long userId);
}
