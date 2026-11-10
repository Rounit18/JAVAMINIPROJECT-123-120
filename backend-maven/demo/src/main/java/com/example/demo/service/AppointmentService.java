package com.example.demo.service;

import com.example.demo.entity.Appointment;
import com.example.demo.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public Appointment bookAppointment(Appointment appointment) {

        boolean alreadyBooked =
                appointmentRepository
                        .existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatus(
                                appointment.getDoctor().getId(),
                                appointment.getAppointmentDate(),
                                appointment.getAppointmentTime(),
                                "BOOKED"
                        );

        if (alreadyBooked) {
            throw new IllegalArgumentException(
                    "This doctor already has an appointment at the selected date and time."
            );
        }

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }
}