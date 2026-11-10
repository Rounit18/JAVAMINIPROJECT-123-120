package com.example.demo;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.entity.Appointment;
import com.example.demo.entity.Doctor;
import com.example.demo.entity.Patient;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.PatientRepository;
import com.example.demo.service.AppointmentService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public AppointmentController(
            AppointmentService appointmentService,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository) {

        this.appointmentService = appointmentService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // PATIENT BOOKS AN APPOINTMENT
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(
            @RequestBody AppointmentRequest request,
            Authentication authentication) {

        if (authentication == null ||
                !authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only patients can book appointments."));
        }

        Patient patient = patientRepository.findByEmail(authentication.getName())
                .orElse(null);

        if (patient == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Patient not found."));
        }

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElse(null);

        if (doctor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Doctor not found."));
        }

        if (request.getAppointmentDate() == null ||
                request.getAppointmentTime() == null) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Date and time are required."));
        }

        Appointment appointment = new Appointment();

        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setStatus("BOOKED");

        Appointment savedAppointment =
                appointmentService.bookAppointment(appointment);

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Appointment booked successfully!");
        response.put("appointmentId", savedAppointment.getId());
        response.put("patientName", patient.getFullName());
        response.put("doctorName", doctor.getFullName());
        response.put("appointmentDate", savedAppointment.getAppointmentDate());
        response.put("appointmentTime", savedAppointment.getAppointmentTime());
        response.put("status", savedAppointment.getStatus());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
                    .body(Map.of("message",
                            "Only doctors can view their appointments."));
        }

        Doctor doctor = doctorRepository.findByEmail(authentication.getName())
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
            data.put("patientName", appointment.getPatient().getFullName());
            data.put("patientEmail", appointment.getPatient().getEmail());
            data.put("appointmentDate", appointment.getAppointmentDate());
            data.put("appointmentTime", appointment.getAppointmentTime());
            data.put("status", appointment.getStatus());

            return data;

        }).toList();

        return ResponseEntity.ok(response);
    }
}
