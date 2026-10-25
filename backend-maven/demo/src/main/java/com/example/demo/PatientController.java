package com.example.demo;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.PatientResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.Patient;
import com.example.demo.service.PatientService;

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
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(
            @Valid @RequestBody RegisterRequest request) {
        try {
            Patient patient = patientService.registerPatient(
                    request.getFullName(),
                    request.getEmail(),
                    request.getPassword()
            );

            PatientResponse response = PatientResponse.from(patient);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "status", "error",
                            "message", exception.getMessage()
                    ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginPatient(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        Optional<Patient> patientOptional =
                patientService.authenticatePatient(
                        request.getEmail(),
                        request.getPassword()
                );

        if (patientOptional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "status", "error",
                            "message", "Invalid email or password."
                    ));
        }

        Patient patient = patientOptional.get();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        patient.getEmail(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_PATIENT"))
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

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Login successful.",
                "patient", PatientResponse.from(patient)
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutPatient(
            HttpServletRequest httpRequest) {

        SecurityContextHolder.clearContext();

        var session = httpRequest.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Logged out successfully."
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentPatient(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "status", "error",
                            "message", "Please log in first."
                    ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "email", authentication.getName()
        ));
    }
}

