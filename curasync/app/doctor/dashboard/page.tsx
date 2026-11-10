"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/appointments/doctor";

interface Appointment {
  appointmentId: number;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
}

export default function DoctorDashboardPage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const menuItems = ["Overview", "Appointments", "Patients", "Availability"];

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Unable to load appointments. Please log in again.");
        }

        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading appointments."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, []);

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const todaysAppointments = appointments.filter(
    (appointment) =>
      appointment.appointmentDate === todayDate &&
      appointment.status === "BOOKED"
  );

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.appointmentDate >= todayDate &&
      appointment.status === "BOOKED"
  );

  const uniquePatients = new Set(
    appointments.map((appointment) => appointment.patientEmail)
  );

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(time: string) {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-700">
          CuraSync
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            Doctor Portal
          </span>

          <Link
            href="/doctor/login"
            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            Logout
          </Link>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 min-h-screen bg-white border-r border-gray-200 p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5">
            Doctor Menu
          </h2>

          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`w-full text-left rounded-lg px-4 py-3 font-medium transition ${
                  activeTab === item
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium text-blue-700">
              Doctor Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Welcome, Doctor!
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your patients and appointments through CuraSync.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mb-6 rounded-xl bg-blue-50 p-4 text-blue-700">
              Loading your appointments...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-500">Today's Appointments</p>
              <h2 className="mt-3 text-3xl font-bold text-blue-700">
                {todaysAppointments.length}
              </h2>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-500">Total Patients</p>
              <h2 className="mt-3 text-3xl font-bold text-green-600">
                {uniquePatients.size}
              </h2>
            </div>

            <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-500">Upcoming Appointments</p>
              <h2 className="mt-3 text-3xl font-bold text-purple-600">
                {upcomingAppointments.length}
              </h2>
            </div>
          </div>

          {/* Selected Section */}
          <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">{activeTab}</h2>

            {/* Overview */}
            {activeTab === "Overview" && (
              <div className="mt-4">
                <p className="text-gray-500">
                  Your appointment and patient statistics are displayed above.
                </p>

                <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-800">
                  Upcoming Appointments
                </h3>

                {upcomingAppointments.length === 0 ? (
                  <p className="text-gray-500">
                    No upcoming appointments yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.appointmentId}
                        className="rounded-lg border border-gray-200 p-4"
                      >
                        <p className="font-semibold text-gray-900">
                          {appointment.patientName}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(appointment.appointmentDate)} at{" "}
                          {formatTime(appointment.appointmentTime)}
                        </p>

                        <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Appointments */}
            {activeTab === "Appointments" && (
              <div className="mt-4">
                {appointments.length === 0 ? (
                  <p className="text-gray-500">
                    No appointments have been booked yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-200 text-sm text-gray-500">
                          <th className="py-3 pr-4">Patient</th>
                          <th className="py-3 pr-4">Email</th>
                          <th className="py-3 pr-4">Date</th>
                          <th className="py-3 pr-4">Time</th>
                          <th className="py-3">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {appointments.map((appointment) => (
                          <tr
                            key={appointment.appointmentId}
                            className="border-b border-gray-100"
                          >
                            <td className="py-4 pr-4 font-medium text-gray-900">
                              {appointment.patientName}
                            </td>

                            <td className="py-4 pr-4 text-sm text-gray-500">
                              {appointment.patientEmail}
                            </td>

                            <td className="py-4 pr-4 text-sm text-gray-700">
                              {formatDate(appointment.appointmentDate)}
                            </td>

                            <td className="py-4 pr-4 text-sm text-gray-700">
                              {formatTime(appointment.appointmentTime)}
                            </td>

                            <td className="py-4">
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                {appointment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Patients */}
            {activeTab === "Patients" && (
              <div className="mt-4">
                {uniquePatients.size === 0 ? (
                  <p className="text-gray-500">
                    Your registered patients will appear here after appointments
                    are booked.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Array.from(uniquePatients).map((email) => {
                      const patient = appointments.find(
                        (appointment) => appointment.patientEmail === email
                      );

                      if (!patient) return null;

                      return (
                        <div
                          key={email}
                          className="rounded-lg border border-gray-200 p-4"
                        >
                          <p className="font-semibold text-gray-900">
                            {patient.patientName}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {patient.patientEmail}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Availability */}
            {activeTab === "Availability" && (
              <div className="mt-4">
                <p className="text-gray-500">
                  Availability management will be implemented next. You will be
                  able to manage your available days and time slots here.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
