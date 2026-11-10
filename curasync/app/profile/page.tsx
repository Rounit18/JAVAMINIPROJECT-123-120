"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = "http://localhost:8080";

interface Patient {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`${API_URL}/api/patients/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        const patientData: Patient = {
          id: data.id ?? data.patient?.id ?? 0,
          fullName:
            data.fullName ??
            data.patient?.fullName ??
            data.name ??
            "Patient",
          email: data.email ?? data.patient?.email ?? "",
          createdAt:
            data.createdAt ?? data.patient?.createdAt ?? "",
        };

        setPatient(patientData);
        setFullName(patientData.fullName);
      } catch {
        setError("Unable to connect to CuraSync server.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  async function saveProfile() {
    if (!fullName.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/patients/me`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update profile.");
        return;
      }

      setPatient((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          fullName:
            data.fullName ??
            data.patient?.fullName ??
            fullName.trim(),
          email: data.email ?? previous.email,
          id: data.id ?? previous.id,
          createdAt: data.createdAt ?? previous.createdAt,
        };
      });

      setEditing(false);
    } catch {
      setError("Unable to connect to CuraSync server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">
            Unable to load profile
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <Link
            href="/login"
            className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  const displayName = patient.fullName?.trim() || "Patient";

  const initials = displayName
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const memberSince = patient.createdAt
    ? new Date(patient.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Recently joined";

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xl font-bold text-white shadow-lg shadow-blue-200">
              C
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                CuraSync
              </h1>

              <p className="text-xs text-slate-500">
                Healthcare, synchronized.
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Account Settings
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            My Profile
          </h2>

          <p className="mt-2 text-slate-500">
            Manage your personal information and account details.
          </p>
        </div>

        {/* Profile Banner */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-xl shadow-blue-100">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[40px] border-white/10" />

          <div className="absolute -bottom-32 right-40 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white/30 bg-white/20 text-3xl font-bold shadow-lg backdrop-blur">
              {initials || "P"}
            </div>

            <div className="flex-1">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Active Patient
              </div>

              <h3 className="text-3xl font-bold tracking-tight">
                {displayName}
              </h3>

              <p className="mt-1 text-blue-100">
                {patient.email}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-lg bg-white/15 px-3 py-1.5 text-sm backdrop-blur">
                  Patient ID: CS-{String(patient.id).padStart(4, "0")}
                </span>

                <span className="rounded-lg bg-white/15 px-3 py-1.5 text-sm backdrop-blur">
                  Member since {memberSince}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setFullName(displayName);
                setEditing(true);
                setError("");
              }}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              ✎ Edit Profile
            </button>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Personal Information */}
          <section className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-sm lg:col-span-2">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Personal Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your registered account information
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                👤
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Full Name
                </p>

                <p className="text-base font-semibold text-slate-800">
                  {displayName}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </p>

                <p className="break-all text-base font-semibold text-slate-800">
                  {patient.email || "Not available"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Patient ID
                </p>

                <p className="text-base font-semibold text-slate-800">
                  CS-{String(patient.id).padStart(4, "0")}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Account Created
                </p>

                <p className="text-base font-semibold text-slate-800">
                  {memberSince}
                </p>
              </div>
            </div>
          </section>

          {/* Security Card */}
          <section className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
              🔒
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Account Security
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your account is protected with secure session-based
              authentication.
            </p>

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <span>✓</span> Secure Session
              </div>

              <p className="mt-1 text-xs text-emerald-600">
                You are currently logged in.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="mt-6 block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Go to Dashboard
            </Link>
          </section>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          CuraSync · Your health, connected.
        </p>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                Account Settings
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                Edit Profile
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Update your personal details below.
              </p>
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Enter your full name"
            />

            {error && (
              <p className="mt-3 text-sm font-medium text-red-500">
                {error}
              </p>
            )}

            <div className="mt-7 flex gap-3">
              <button
                onClick={() => {
                  setEditing(false);
                  setError("");
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}