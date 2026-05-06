package com.hms.billing.service;

import com.hms.billing.dto.InvoiceRequest;
import com.hms.billing.entity.Invoice;
import com.hms.billing.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class BillingService {

    private final InvoiceRepository invoiceRepository;

    public BillingService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Invoice createInvoice(InvoiceRequest request) {
        Invoice invoice = new Invoice();
        invoice.setAppointmentId(request.getAppointmentId());
        invoice.setPatientId(request.getPatientId());
        invoice.setUserId(request.getPatientId());
        invoice.setTotalAmount(request.getTotalAmount());
        invoice.setTax(request.getTax());
        invoice.setPaymentMethod(Invoice.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
        invoice.setPaymentStatus(Invoice.PaymentStatus.UNPAID);
        return invoiceRepository.save(invoice);
    }

    public Invoice getByAppointmentId(Long appointmentId) {
        return invoiceRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for appointment: " + appointmentId));
    }

    public List<Invoice> getInvoicesByPatientId(Long patientId) {
        return invoiceRepository.findByPatientId(patientId);
    }

    public List<Invoice> getInvoicesByUserId(Long userId) {
        return invoiceRepository.findByUserId(userId);
    }

    public Invoice updatePaymentStatus(Long id, String status, Long userId) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));

        if (!invoice.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only view your own invoices");
        }

        invoice.setPaymentStatus(Invoice.PaymentStatus.valueOf(status.toUpperCase()));
        return invoiceRepository.save(invoice);
    }

    public Invoice getInvoiceById(Long id, Long userId) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));

        if (!invoice.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only view your own invoices");
        }

        return invoice;
    }

    public Invoice payInvoice(Long id, String paymentMethod, Long userId) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));

        if (!invoice.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only pay your own invoices");
        }

        invoice.setPaymentMethod(Invoice.PaymentMethod.valueOf(paymentMethod.toUpperCase()));
        invoice.setPaymentStatus(Invoice.PaymentStatus.PAID);
        return invoiceRepository.save(invoice);
    }

    public Invoice markAsPaid(Long id, Long userId) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));

        invoice.setPaymentStatus(Invoice.PaymentStatus.PAID);
        return invoiceRepository.save(invoice);
    }
}

