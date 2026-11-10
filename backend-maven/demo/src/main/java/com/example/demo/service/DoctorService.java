package com.example.demo.service;

import com.example.demo.entity.Doctor;
import com.example.demo.repository.DoctorRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(
            DoctorRepository doctorRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Doctor registerDoctor(
            String fullName,
            String email,
            String rawPassword,
            String specialization,
            String qualification,
            int experienceYears
    ) {
        String normalizedEmail = email.trim().toLowerCase();

        if (doctorRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        if (experienceYears < 0) {
            throw new IllegalArgumentException(
                    "Experience years cannot be negative."
            );
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);

        Doctor doctor = new Doctor(
                fullName.trim(),
                normalizedEmail,
                hashedPassword,
                specialization.trim(),
                qualification.trim(),
                experienceYears
        );

        return doctorRepository.save(doctor);
    }

    @Transactional(readOnly = true)
    public Optional<Doctor> authenticateDoctor(
            String email,
            String rawPassword
    ) {
        String normalizedEmail = email.trim().toLowerCase();

        Optional<Doctor> doctorOptional =
                doctorRepository.findByEmail(normalizedEmail);

        if (doctorOptional.isEmpty()) {
            return Optional.empty();
        }

        Doctor doctor = doctorOptional.get();

        boolean passwordMatches = passwordEncoder.matches(
                rawPassword,
                doctor.getPassword()
        );

        if (!passwordMatches) {
            return Optional.empty();
        }

        return Optional.of(doctor);
    }

    @Transactional(readOnly = true)
    public Optional<Doctor> getDoctorByEmail(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        return doctorRepository.findByEmail(normalizedEmail);
    }

    // GET ALL REGISTERED DOCTORS
    @Transactional(readOnly = true)
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
}