"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DOCTORS_API = "http://localhost:8080/api/doctors";
const BOOKING_API = "http://localhost:8080/api/appointments/book";
const VERIFY_PAYMENT_API =
  "http://localhost:8080/api/appointments/verify-payment";

type Doctor = {
  id: number;
  fullName: string;
  email: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
};

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color: string;
  };
};

type RazorpayInstance = {
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

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

  // Detect whether the selected appointment slot is unavailable
  const slotUnavailable =
    !bookingSuccess &&
    message !== "" &&
    [
      "already having an appointment",
      "already has an appointment",
      "already booked",
      "doctor is unavailable",
      "doctor unavailable",
      "time slot is unavailable",
      "cannot book as the doctor",
    ].some((phrase) => message.toLowerCase().includes(phrase));

  const unavailableDoctor = doctors.find(
    (doctor) => doctor.id === selectedDoctor
  );

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

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

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
      // STEP 1: Create appointment and Razorpay order
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

      if (!response.ok) {
        throw new Error(data.message || "Appointment booking failed.");
      }

      const appointmentId = data.appointmentId;
      const orderId = data.orderId;
      const amount = data.amount;
      const currency = data.currency;
      const keyId = data.keyId;

      if (!appointmentId || !orderId || !amount || !keyId) {
        throw new Error(
          "Payment details could not be retrieved from the server."
        );
      }

      // STEP 2: Load Razorpay Checkout
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Could not load Razorpay Checkout. Please try again."
        );
      }

      // STEP 3: Configure Razorpay Checkout
      const options: RazorpayOptions = {
        key: keyId,
        amount: amount,
        currency: currency || "INR",
        name: "CuraSync",
        description: "Doctor Consultation Appointment",
        order_id: orderId,

        // STEP 4: Razorpay returns successful payment details
        handler: async function (
          paymentResponse: RazorpaySuccessResponse
        ) {
          try {
            // STEP 5: Verify payment through Spring Boot backend
            const verificationResponse = await fetch(
              VERIFY_PAYMENT_API,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  appointmentId: appointmentId,
                  razorpayOrderId:
                    paymentResponse.razorpay_order_id,
                  razorpayPaymentId:
                    paymentResponse.razorpay_payment_id,
                  razorpaySignature:
                    paymentResponse.razorpay_signature,
                }),
              }
            );

            const verificationData =
              await verificationResponse.json();

            if (!verificationResponse.ok) {
              setBookingSuccess(false);

              setMessage(
                verificationData.message ||
                  "Payment verification failed. Please contact support."
              );

              return;
            }

            // STEP 6: Appointment successfully confirmed
            setBookingSuccess(true);

            setMessage(
              `Payment successful! Your appointment with the doctor is confirmed. Appointment ID: ${appointmentId}`
            );

            setSelectedDoctor(null);
            setAppointmentDate("");
            setAppointmentTime("");
          } catch {
            setBookingSuccess(false);

            setMessage(
              "Payment was completed, but verification could not be reached. Please contact CuraSync support with your appointment ID: " +
                appointmentId
            );
          } finally {
            setBooking(false);
          }
        },

        modal: {
          ondismiss: function () {
            setBooking(false);
            setMessage(
              "Payment window closed. Your appointment is not confirmed until payment is completed."
            );
          },
        },

        theme: {
          color: "#2563EB",
        },
      };

      // STEP 7: Open Razorpay payment popup
      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (err) {
      setBookingSuccess(false);

      setMessage(
        err instanceof Error
          ? err.message
          : "Could not connect to the server."
      );

      setBooking(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
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

      {/* MAIN SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* HERO */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-8 text-white sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
            Patient Portal
          </p>

          <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
            Find Your Doctor
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-blue-50">
            Browse our registered doctors, view consultation fees, and book
            your appointment conveniently through CuraSync.
          </p>
        </div>

        {/* DOCTORS TITLE */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Registered Doctors
          </h2>

          <p className="mt-2 text-slate-500">
            Choose a doctor and schedule your appointment.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-10 text-center">
            <p className="text-lg font-semibold text-blue-600">
              Loading doctors...
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* NO DOCTORS */}
        {!loading && !error && doctors.length === 0 && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-800">
              No doctors are registered yet.
            </p>
          </div>
        )}

        {/* DOCTOR CARDS */}
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

                <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Consultation Fee
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-emerald-800">
                    ₹
                    {Number(doctor.consultationFee).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

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

                {/* APPOINTMENT FORM */}
                {selectedDoctor === doctor.id && (
                  <div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-800">
                      Select Appointment
                    </h4>

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-sm font-medium text-emerald-700">
                        Amount Payable
                      </p>

                      <p className="text-xl font-bold text-emerald-800">
                        ₹
                        {Number(doctor.consultationFee).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Appointment Date
                      </label>

                      <input
                        type="date"
                        min={new Date().toLocaleDateString("en-CA")}
                        value={appointmentDate}
                        onChange={(e) =>
                          setAppointmentDate(e.target.value)
                        }
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
                        onChange={(e) =>
                          setAppointmentTime(e.target.value)
                        }
                        disabled={booking}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                      />
                    </div>

                    <button
                      onClick={() => handleBooking(doctor.id)}
                      disabled={booking}
                      className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {booking
                        ? "Opening Payment..."
                        : "Proceed to Payment"}
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

        {/* PREMIUM SUCCESS / UNAVAILABLE / ERROR UI */}
        {message && (
          <div className="mt-10 flex justify-center">
            {/* SUCCESS CARD */}
            {bookingSuccess ? (
              <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-10 text-center text-white">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
                    <svg
                      className="h-12 w-12 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>

                  <h2 className="mt-6 text-3xl font-extrabold">
                    Appointment Confirmed!
                  </h2>

                  <p className="mt-3 text-emerald-50">
                    Your payment was successful and your appointment
                    has been booked.
                  </p>
                </div>

                <div className="p-8">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                    <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                      Payment Status
                    </p>

                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      PAID SUCCESSFULLY
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">
                      Appointment Confirmation
                    </p>

                    <p className="mt-3 break-words text-lg font-semibold leading-7 text-slate-800">
                      {message}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/dashboard"
                      className="flex-1 rounded-xl bg-blue-600 px-6 py-4 text-center font-bold text-white shadow-md transition hover:bg-blue-700"
                    >
                      Return to Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setMessage("");
                        setBookingSuccess(false);
                      }}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      Book Another Appointment
                    </button>
                  </div>

                  <p className="mt-6 text-center text-sm text-slate-400">
                    Thank you for choosing CuraSync for your healthcare needs.
                  </p>
                </div>
              </div>
            ) : slotUnavailable ? (
              /* PREMIUM DOCTOR UNAVAILABLE CARD */
              <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl">
                {/* HEADER */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 px-8 py-10 text-center text-white">
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/5" />
                  <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-white/5" />

                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm">
                    <svg
                      className="h-11 w-11 text-blue-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="16"
                        rx="2"
                        strokeWidth={1.8}
                      />
                      <path
                        d="M16 3v4M8 3v4M3 11h18"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 14v3M10.5 15.5h3"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                      />
                    </svg>

                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-900 bg-amber-400 text-sm font-extrabold text-slate-900">
                      !
                    </span>
                  </div>

                  <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.25em] text-blue-200">
                    Appointment Availability
                  </p>

                  <h2 className="relative mt-3 text-3xl font-extrabold sm:text-4xl">
                    This Time Slot Is Unavailable
                  </h2>

                  <p className="relative mx-auto mt-4 max-w-md text-sm leading-6 text-blue-100">
                    We’re sorry, but this doctor is already attending another
                    patient during your selected time.
                  </p>
                </div>

                {/* BODY */}
                <div className="p-6 sm:p-8">
                  {/* UNAVAILABLE NOTICE */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                        <svg
                          className="h-6 w-6 text-amber-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                          />
                        </svg>
                      </div>

                      <div>
                        <h3 className="font-bold text-amber-900">
                          Doctor’s Schedule Conflict
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-amber-800">
                          Another appointment is scheduled for this time.
                          Please select a different time slot to continue
                          with your booking.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SELECTED APPOINTMENT DETAILS */}
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">
                        Your Selected Appointment
                      </h3>

                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                        UNAVAILABLE
                      </span>
                    </div>

                    <div className="mt-5 space-y-4">
                      {unavailableDoctor && (
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                            🩺
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-500">
                              Doctor
                            </p>

                            <p className="font-bold text-slate-900">
                              {unavailableDoctor.fullName.startsWith("Dr.")
                                ? unavailableDoctor.fullName
                                : `Dr. ${unavailableDoctor.fullName}`}
                            </p>

                            <p className="text-sm text-blue-600">
                              {unavailableDoctor.specialization}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Selected Date
                          </p>

                          <p className="mt-2 font-bold text-slate-900">
                            {appointmentDate
                              ? new Date(
                                  `${appointmentDate}T00:00:00`
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Not selected"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Selected Time
                          </p>

                          <p className="mt-2 font-bold text-slate-900">
                            {appointmentTime || "Not selected"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => {
                        setMessage("");
                        setAppointmentTime("");
                        setBookingSuccess(false);
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12M8 12h12M8 17h12M3 7h.01M3 12h.01M3 17h.01"
                        />
                      </svg>

                      Choose Another Time
                    </button>

                    <Link
                      href="/dashboard"
                      className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Return to Dashboard
                    </Link>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-slate-400">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>

                    Your healthcare journey matters to us.
                  </div>
                </div>
              </div>
            ) : (
              /* GENERAL ERROR CARD */
              <div className="w-full max-w-2xl rounded-2xl border border-blue-200 bg-blue-50 p-6 text-blue-800 shadow-sm">
                <p className="font-semibold">{message}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
