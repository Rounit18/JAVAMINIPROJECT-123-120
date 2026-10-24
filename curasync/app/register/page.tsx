"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto grid min-h-[600px] max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">
        <section className="hidden flex-col justify-center bg-gradient-to-br from-blue-700 to-cyan-500 p-12 text-white md:flex">
          <Link href="/" className="mb-10 text-3xl font-bold">
            CuraSync
          </Link>

          <h1 className="text-4xl font-bold leading-tight">
            Your healthcare journey starts here.
          </h1>

          <p className="mt-5 leading-7 text-blue-50">
            Smarter Healthcare. Seamless Care. Manage your healthcare
            journey with CuraSync.
          </p>

          <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-lg font-semibold">
              One platform. Better care.
            </p>
            <p className="mt-2 text-sm text-blue-50">
              Appointments, healthcare professionals, and connected care.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-10 md:p-12">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Back to home
          </Link>

          <h2 className="mt-8 text-3xl font-bold text-slate-900">
            Create your account
          </h2>

          <p className="mt-2 text-slate-500">
            Enter your details to get started.
          </p>

          {success ? (
            <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 className="text-lg font-bold text-green-800">
                Form completed successfully!
              </h3>

              <p className="mt-2 text-sm leading-6 text-green-700">
                Your form passed the checks. Real account creation has not
                been connected yet.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setName("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Register another account
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <label className="flex items-start gap-3 text-sm leading-5 text-slate-600">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 accent-blue-600"
                />
                <span>
                  I agree to the Terms of Service and Privacy Policy.
                </span>
              </label>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Create account
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-400">
            CuraSync prototype. Account storage is not connected yet.
          </p>
        </section>
      </div>
    </main>
  );
}