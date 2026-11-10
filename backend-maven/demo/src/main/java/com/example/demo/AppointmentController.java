package com.example.demo;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.PaymentVerificationRequest;
import com.example.demo.entity.Appointment;
import com.example.demo.entity.Doctor;
import com.example.demo.entity.Patient;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.PatientRepository;
import com.example.demo.service.AppointmentService;
import com.example.demo.service.PaymentService;
import com.razorpay.RazorpayException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowCredentials = "true"
)
public class AppointmentController {

    private static final Logger logger =
            LoggerFactory.getLogger(AppointmentController.class);

    private final AppointmentService appointmentService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentService paymentService;

    public AppointmentController(
            AppointmentService appointmentService,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            PaymentService paymentService) {

        this.appointmentService = appointmentService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.paymentService = paymentService;
    }

    // PATIENT CREATES AN APPOINTMENT AND PAYMENT ORDER
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(
            @RequestBody AppointmentRequest request,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only patients can book appointments."
                    ));
        }

        try {

            Patient patient = patientRepository
                    .findByEmail(authentication.getName())
                    .orElse(null);

            if (patient == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Patient not found."));
            }

            Doctor doctor = doctorRepository
                    .findById(request.getDoctorId())
                    .orElse(null);

            if (doctor == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Doctor not found."));
            }

            if (request.getAppointmentDate() == null ||
                    request.getAppointmentTime() == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Date and time are required."
                        ));
            }

            if (doctor.getConsultationFee() == null ||
                    doctor.getConsultationFee().signum() <= 0) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Doctor consultation fee is invalid."
                        ));
            }

            Appointment appointment = new Appointment();

            appointment.setPatient(patient);
            appointment.setDoctor(doctor);
            appointment.setAppointmentDate(request.getAppointmentDate());
            appointment.setAppointmentTime(request.getAppointmentTime());

            appointment.setAmount(doctor.getConsultationFee());
            appointment.setStatus("PENDING_PAYMENT");
            appointment.setPaymentStatus("PENDING");

            Appointment savedAppointment =
                    appointmentService.bookAppointment(appointment);

            Map<String, Object> paymentDetails =
                    paymentService.createOrder(savedAppointment);

            Map<String, Object> response = new HashMap<>();

            response.put(
                    "message",
                    "Appointment created. Complete payment to confirm."
            );

            response.put("appointmentId", savedAppointment.getId());
            response.put("patientName", patient.getFullName());
            response.put("doctorName", doctor.getFullName());

            response.put(
                    "appointmentDate",
                    savedAppointment.getAppointmentDate()
            );

            response.put(
                    "appointmentTime",
                    savedAppointment.getAppointmentTime()
            );

            response.put("status", savedAppointment.getStatus());

            response.putAll(paymentDetails);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException e) {

            logger.warn("Appointment booking validation failed: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));

        } catch (RazorpayException e) {

            logger.error("RAZORPAY ORDER CREATION FAILED", e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Unable to create Razorpay payment order."
                    ));

        } catch (Exception e) {

            logger.error("APPOINTMENT BOOKING FAILED", e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Appointment booking failed."
                    ));
        }
    }

    // PATIENT VERIFIES RAZORPAY PAYMENT
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentVerificationRequest request,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only patients can verify payments."
                    ));
        }

        if (request.getAppointmentId() == null ||
                request.getRazorpayOrderId() == null ||
                request.getRazorpayPaymentId() == null ||
                request.getRazorpaySignature() == null) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            "Payment verification details are required."
                    ));
        }

        Patient patient = patientRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (patient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Patient not found."));
        }

        Appointment appointment = appointmentRepository
                .findById(request.getAppointmentId())
                .orElse(null);

        if (appointment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Appointment not found."));
        }

        if (!appointment.getPatient().getId().equals(patient.getId())) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "You cannot verify another patient's payment."
                    ));
        }

        try {

            Appointment verifiedAppointment =
                    paymentService.verifyPayment(appointment, request);

            Map<String, Object> response = new HashMap<>();

            response.put(
                    "message",
                    "Payment verified successfully. Appointment confirmed!"
            );

            response.put(
                    "appointmentId",
                    verifiedAppointment.getId()
            );

            response.put(
                    "paymentStatus",
                    verifiedAppointment.getPaymentStatus()
            );

            response.put(
                    "status",
                    verifiedAppointment.getStatus()
            );

            response.put(
                    "razorpayPaymentId",
                    verifiedAppointment.getRazorpayPaymentId()
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            logger.warn("PAYMENT VERIFICATION VALIDATION FAILED: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));

        } catch (RazorpayException e) {

            logger.error("RAZORPAY PAYMENT VERIFICATION FAILED", e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Payment verification failed."
                    ));

        } catch (Exception e) {

            logger.error("PAYMENT VERIFICATION FAILED", e);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "message",
                            "Payment verification failed."
                    ));
        }
    }

    // DOCTOR VIEWS THEIR APPOINTMENTS
    @GetMapping("/doctor")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getDoctorAppointments(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only doctors can view their appointments."
                    ));
        }

        Doctor doctor = doctorRepository
                .findByEmail(authentication.getName())
                .orElse(null);

        if (doctor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Doctor not found."));
        }

        var appointments =
                appointmentService.getDoctorAppointments(doctor.getId());

        var response = appointments.stream().map(appointment -> {

            Map<String, Object> data = new HashMap<>();

            data.put("appointmentId", appointment.getId());

            data.put(
                    "patientName",
                    appointment.getPatient().getFullName()
            );

            data.put(
                    "patientEmail",
                    appointment.getPatient().getEmail()
            );

            data.put(
                    "appointmentDate",
                    appointment.getAppointmentDate()
            );

            data.put(
                    "appointmentTime",
                    appointment.getAppointmentTime()
            );

            data.put("status", appointment.getStatus());

            return data;

        }).toList();

        return ResponseEntity.ok(response);
    }
}