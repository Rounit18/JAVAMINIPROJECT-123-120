"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DOCTORS_API = "http://localhost:8080/api/doctors";
const BOOKING_API = "http://localhost:8080/api/appointments/book";

type Doctor = {
  id: number;
  fullName: string;
  email: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch(DOCTORS_API, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Could not load doctors. Please log in again.");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setDoctors(data);
        } else if (Array.isArray(data.doctors)) {
          setDoctors(data.doctors);
        } else {
          setError("Could not retrieve doctors.");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, []);

  async function handleBooking(doctorId: number) {
    if (booking) return;

    if (!appointmentDate || !appointmentTime) {
      setMessage("Please select an appointment date and time.");
      setBookingSuccess(false);
      return;
    }

    const selectedDateTime = new Date(
      `${appointmentDate}T${appointmentTime}`
    );

    if (selectedDateTime <= new Date()) {
      setMessage("Please select a future date and time.");
      setBookingSuccess(false);
      return;
    }

    setBooking(true);
    setMessage("");
    setBookingSuccess(false);

    try {
      const response = await fetch(BOOKING_API, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          appointmentDate,
          appointmentTime,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "BOOKED") {
        setBookingSuccess(true);

        setMessage(
          `${data.message} Doctor: ${data.doctorName}. Appointment ID: ${data.appointmentId}`
        );

        setSelectedDoctor(null);
        setAppointmentDate("");
        setAppointmentTime("");
      } else {
        setBookingSuccess(false);

        setMessage(
          data.message || "Appointment booking failed. Please try again."
        );
      }
    } catch {
      setBookingSuccess(false);
      setMessage("Could not connect to the server.");
    } finally {
      setBooking(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/dashboard"
            className="text-2xl font-extrabold text-slate-950"
          >
            Cura<span className="text-blue-600">Sync</span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-8 text-white sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
            Patient Portal
          </p>

          <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
            Find Your Doctor
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-blue-50">
            Browse our registered doctors and book your appointment
            conveniently through CuraSync.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Registered Doctors
          </h2>

          <p className="mt-2 text-slate-500">
            Choose a doctor and schedule your appointment.
          </p>
        </div>

        {loading && (
          <div className="mt-10 text-center">
            <p className="text-lg font-semibold text-blue-600">
              Loading doctors...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && doctors.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-800">
              No doctors are registered yet.
            </p>
          </div>
        )}

        {!loading && doctors.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <article
                key={doctor.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                  🩺
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {doctor.fullName.startsWith("Dr.")
                    ? doctor.fullName
                    : `Dr. ${doctor.fullName}`}
                </h3>

                <p className="mt-2 font-semibold text-blue-600">
                  {doctor.specialization}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {doctor.qualification}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  {doctor.experienceYears} years of experience
                </p>

                <button
                  onClick={() => {
                    setSelectedDoctor(doctor.id);
                    setMessage("");
                    setBookingSuccess(false);
                  }}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Book Appointment
                </button>

                {selectedDoctor === doctor.id && (
                  <div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-800">
                      Select Appointment
                    </h4>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Appointment Date
                      </label>

                      <input
                        type="date"
                        min={new Date().toLocaleDateString("en-CA")}
                        value={appointmentDate}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        disabled={booking}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Appointment Time
                      </label>

                      <input
                        type="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        disabled={booking}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                      />
                    </div>

                    <button
                      onClick={() => handleBooking(doctor.id)}
                      disabled={booking}
                      className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {booking ? "Booking..." : "Confirm Booking"}
                    </button>

                    <button
                      onClick={() => {
                        if (!booking) {
                          setSelectedDoctor(null);
                          setMessage("");
                        }
                      }}
                      disabled={booking}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {message && (
          <div
            className={`mt-8 rounded-xl border p-4 font-medium ${
              bookingSuccess
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}
      </section>
    </main>
  );
}