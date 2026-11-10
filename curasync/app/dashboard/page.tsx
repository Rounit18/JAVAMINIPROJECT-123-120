"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8080/api/patients/me";
const LOGOUT_URL = "http://localhost:8080/api/patients/logout";

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch(API_URL, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (data?.status !== "success" || !data?.email) {
          router.replace("/login");
          return;
        }

        setEmail(data.email);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch(LOGOUT_URL, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        router.replace("/login");
        router.refresh();
      } else {
        setLoggingOut(false);
        alert("Could not log out. Please try again.");
      }
    } catch {
      setLoggingOut(false);
      alert("Could not connect to the server.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-blue-600">
          Checking your patient session...
        </p>
      </main>
    );
  }

  if (!email) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-extrabold text-slate-950">
            Cura<span className="text-blue-600">Sync</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-slate-600 sm:block">
              {email}
            </span>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-8 text-white sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-100">
            Patient Portal
          </p>

          <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl">
            Welcome to CuraSync!
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-blue-50">
            Your healthcare journey, connected. Manage your healthcare
            activities from one convenient place.
          </p>

          <p className="mt-5 text-sm font-medium text-blue-100">
            Logged in as: {email}
          </p>
        </div>

        <h2 className="mt-10 text-2xl font-bold text-slate-900">
          Your Healthcare
        </h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            icon="📅"
            title="Appointments"
            description="Your appointment management section."
          />

          <DashboardCard
            icon="🩺"
            title="Find Doctors"
            description="Your doctor discovery section."
          />

          <DashboardCard
            icon="📋"
            title="Medical Records"
            description="Your medical records section."
          />
        </div>

        <p className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          This is an early dashboard prototype. The cards are placeholders;
          appointment booking, doctor discovery, and medical records are not
          connected yet.
        </p>
      </section>
    </main>
  );
}

function DashboardCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </article>
  );
}