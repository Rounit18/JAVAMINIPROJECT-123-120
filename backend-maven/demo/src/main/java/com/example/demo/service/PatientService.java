package com.example.demo.service;

import com.example.demo.entity.Patient;
import com.example.demo.repository.PatientRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public PatientService(
            PatientRepository patientRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Patient registerPatient(
            String fullName,
            String email,
            String rawPassword
    ) {
        String normalizedEmail = email.trim().toLowerCase();

        if (patientRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);

        Patient patient = new Patient(
                fullName.trim(),
                normalizedEmail,
                hashedPassword
        );

        return patientRepository.save(patient);
    }

    @Transactional(readOnly = true)
    public Optional<Patient> authenticatePatient(
            String email,
            String rawPassword
    ) {
        String normalizedEmail = email.trim().toLowerCase();

        Optional<Patient> patientOptional =
                patientRepository.findByEmail(normalizedEmail);

        if (patientOptional.isEmpty()) {
            return Optional.empty();
        }

        Patient patient = patientOptional.get();

        boolean passwordMatches = passwordEncoder.matches(
                rawPassword,
                patient.getPassword()
        );

        if (!passwordMatches) {
            return Optional.empty();
        }

        return Optional.of(patient);
    }
}