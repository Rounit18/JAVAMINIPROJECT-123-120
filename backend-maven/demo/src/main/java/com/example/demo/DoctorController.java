package com.example.demo;

import com.example.demo.dto.DoctorRegisterRequest;
import com.example.demo.dto.LoginRequest;
import com.example.demo.entity.Doctor;
import com.example.demo.service.DoctorService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    // ================= REGISTER DOCTOR =================

    @PostMapping("/register")
    public ResponseEntity<?> registerDoctor(
            @Valid @RequestBody DoctorRegisterRequest request) {

        try {
            Doctor doctor = doctorService.registerDoctor(
                    request.getFullName(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getSpecialization(),
                    request.getQualification(),
                    request.getExperienceYears()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "status", "success",
                            "message", "Doctor registered successfully.",
                            "id", doctor.getId(),
                            "fullName", doctor.getFullName(),
                            "email", doctor.getEmail(),
                            "specialization", doctor.getSpecialization(),
                            "qualification", doctor.getQualification(),
                            "experienceYears", doctor.getExperienceYears(),
                            "consultationFee", doctor.getConsultationFee()
                    ));

        } catch (IllegalArgumentException exception) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "status", "error",
                            "message", exception.getMessage()
                    ));
        }
    }

    // ================= LOGIN DOCTOR =================

    @PostMapping("/login")
    public ResponseEntity<?> loginDoctor(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        Optional<Doctor> doctorOptional =
                doctorService.authenticateDoctor(
                        request.getEmail(),
                        request.getPassword()
                );

        if (doctorOptional.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "status", "error",
                            "message", "Invalid email or password."
                    ));
        }

        Doctor doctor = doctorOptional.get();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        doctor.getEmail(),
                        null,
                        List.of(
                                new SimpleGrantedAuthority("ROLE_DOCTOR")
                        )
                );

        SecurityContext securityContext =
                SecurityContextHolder.createEmptyContext();

        securityContext.setAuthentication(authentication);

        SecurityContextHolder.setContext(securityContext);

        httpRequest.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository
                        .SPRING_SECURITY_CONTEXT_KEY,
                securityContext
        );

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "message", "Doctor login successful.",
                        "doctor", Map.of(
                                "id", doctor.getId(),
                                "fullName", doctor.getFullName(),
                                "email", doctor.getEmail(),
                                "specialization", doctor.getSpecialization(),
                                "qualification", doctor.getQualification(),
                                "experienceYears", doctor.getExperienceYears(),
                                "consultationFee", doctor.getConsultationFee()
                        )
                )
        );
    }

    // ================= GET ALL DOCTORS =================

    @GetMapping
    public ResponseEntity<?> getAllDoctors() {

        List<Doctor> doctors = doctorService.getAllDoctors();

        List<Map<String, Object>> doctorList = doctors.stream()
                .map(doctor -> Map.<String, Object>of(
                        "id", doctor.getId(),
                        "fullName", doctor.getFullName(),
                        "email", doctor.getEmail(),
                        "specialization", doctor.getSpecialization(),
                        "qualification", doctor.getQualification(),
                        "experienceYears", doctor.getExperienceYears(),
                        "consultationFee", doctor.getConsultationFee()
                ))
                .toList();

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "doctors", doctorList
                )
        );
    }
}