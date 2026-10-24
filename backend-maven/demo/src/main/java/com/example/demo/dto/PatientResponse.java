package com.example.demo.dto;

import com.example.demo.entity.Patient;

import java.time.LocalDateTime;

public class PatientResponse {

    private Long id;
    private String fullName;
    private String email;
    private LocalDateTime createdAt;

    public PatientResponse() {
    }

    public PatientResponse(
            Long id,
            String fullName,
            String email,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.createdAt = createdAt;
    }

    public static PatientResponse from(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getFullName(),
                patient.getEmail(),
                patient.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}