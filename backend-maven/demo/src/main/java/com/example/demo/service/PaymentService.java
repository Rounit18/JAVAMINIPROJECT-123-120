package com.example.demo.service;

import com.example.demo.dto.PaymentVerificationRequest;
import com.example.demo.entity.Appointment;
import com.example.demo.repository.AppointmentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final AppointmentRepository appointmentRepository;

    @Value("${RAZORPAY_KEY_SECRET}")
    private String keySecret;

    public PaymentService(
            RazorpayClient razorpayClient,
            AppointmentRepository appointmentRepository
    ) {
        this.razorpayClient = razorpayClient;
        this.appointmentRepository = appointmentRepository;
    }

    // CREATE RAZORPAY PAYMENT ORDER
    @Transactional
    public Map<String, Object> createOrder(Appointment appointment)
            throws RazorpayException {

        BigDecimal amount = appointment.getDoctor()
                .getConsultationFee()
                .setScale(2, RoundingMode.HALF_UP);

        int amountInPaise = amount
                .multiply(BigDecimal.valueOf(100))
                .intValueExact();

        JSONObject orderRequest = new JSONObject();

        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put(
                "receipt",
                "curasync_appointment_" + appointment.getId()
        );

        Order order = razorpayClient.orders.create(orderRequest);

        appointment.setAmount(amount);
        appointment.setStatus("PENDING_PAYMENT");
        appointment.setPaymentStatus("PENDING");
        appointment.setRazorpayOrderId(order.get("id"));

        appointmentRepository.save(appointment);

        Map<String, Object> response = new HashMap<>();

        response.put("orderId", order.get("id"));
        response.put("amount", amountInPaise);
        response.put("currency", "INR");
        response.put("keyId", System.getProperty("RAZORPAY_KEY_ID"));

        return response;
    }

    // VERIFY RAZORPAY PAYMENT
    @Transactional
    public Appointment verifyPayment(
            Appointment appointment,
            PaymentVerificationRequest request
    ) throws RazorpayException {

        // Check whether payment was already verified
        if ("PAID".equals(appointment.getPaymentStatus())) {

            if (request.getRazorpayPaymentId()
                    .equals(appointment.getRazorpayPaymentId())) {

                return appointment;
            }

            throw new IllegalArgumentException(
                    "This appointment has already been paid."
            );
        }

        // Check appointment is awaiting payment
        if (!"PENDING_PAYMENT".equals(appointment.getStatus()) ||
                !"PENDING".equals(appointment.getPaymentStatus())) {

            throw new IllegalArgumentException(
                    "Appointment is not awaiting payment."
            );
        }

        // Verify Razorpay order ID matches our stored order
        if (appointment.getRazorpayOrderId() == null ||
                !appointment.getRazorpayOrderId()
                        .equals(request.getRazorpayOrderId())) {

            throw new IllegalArgumentException(
                    "Invalid Razorpay order ID."
            );
        }

        // Prepare signature verification data
        JSONObject verificationData = new JSONObject();

        verificationData.put(
                "razorpay_order_id",
                request.getRazorpayOrderId()
        );

        verificationData.put(
                "razorpay_payment_id",
                request.getRazorpayPaymentId()
        );

        verificationData.put(
                "razorpay_signature",
                request.getRazorpaySignature()
        );

        // Verify payment signature using Razorpay SDK
        boolean isValid = Utils.verifyPaymentSignature(
                verificationData,
                keySecret
        );

        if (!isValid) {

            throw new IllegalArgumentException(
                    "Razorpay payment signature verification failed."
            );
        }

        // Payment verification succeeded
        appointment.setRazorpayPaymentId(
                request.getRazorpayPaymentId()
        );

        appointment.setPaymentStatus("PAID");
        appointment.setStatus("BOOKED");

        return appointmentRepository.save(appointment);
    }
}
