package com.hms.billing.controller;

import com.hms.billing.dto.InvoiceRequest;
import com.hms.billing.entity.Invoice;
import com.hms.billing.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping
    public ResponseEntity<Invoice> createInvoice(@RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(billingService.createInvoice(request));
    }

    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        return ResponseEntity.ok(billingService.getAllInvoices());
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<Invoice> getByAppointmentId(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(billingService.getByAppointmentId(appointmentId));
    }

    @GetMapping("/my-invoices")
    public ResponseEntity<List<Invoice>> getMyInvoices(@RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(billingService.getInvoicesByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(billingService.getInvoiceById(id, userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Invoice> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(billingService.updatePaymentStatus(id, status, userId));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Invoice> payInvoice(
            @PathVariable Long id,
            @RequestParam String paymentMethod,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(billingService.payInvoice(id, paymentMethod, userId));
    }

    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<Invoice> markAsPaid(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(billingService.markAsPaid(id, userId));
    }
}
