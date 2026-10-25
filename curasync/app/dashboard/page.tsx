"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-extrabold text-slate-950">
            Cura<span className="text-blue-600">Sync</span>
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Login page
          </Link>
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

