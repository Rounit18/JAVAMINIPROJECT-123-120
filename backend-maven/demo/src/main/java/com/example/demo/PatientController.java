package com.example.demo;

import com.example.demo.dto.PatientResponse;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.Patient;
import com.example.demo.service.PatientService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerPatient(
            @Valid @RequestBody RegisterRequest request
    ) {
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
                    .body(java.util.Map.of(
                            "status", "error",
                            "message", exception.getMessage()
                    ));
        }
    }
}