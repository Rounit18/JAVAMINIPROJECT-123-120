"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8080/api/patients/login";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

async function handleSubmit(
event: React.FormEvent<HTMLFormElement>
) {
event.preventDefault();
setError("");
setLoading(true);


try {
  const response = await fetch(API_URL, {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: email.trim(),
    password,
  }),
});

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    setError(
      data?.message || "Invalid email or password. Please try again."
    );
    return;
  }

  if (data?.status !== "success" || !data?.patient) {
    setError("The server returned an unexpected response.");
    return;
  }

  // Temporary redirect until secure session management is implemented.
  router.push("/dashboard");
} catch {
  setError(
    "Could not connect to the server. Make sure the CuraSync backend is running."
  );
} finally {
  setLoading(false);
}


}

return ( <main className="flex min-h-screen bg-white">
{/* Left Side */} <section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-12 text-white lg:flex"> <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" /> <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />


    <Link href="/" className="relative z-10 flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-blue-600">
        ✚
      </div>

      <div>
        <p className="text-2xl font-extrabold">
          Cura<span className="text-cyan-200">Sync</span>
        </p>
        <p className="text-xs tracking-widest text-blue-100">
          SMARTER HEALTHCARE
        </p>
      </div>
    </Link>

    <div className="relative z-10 max-w-xl">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-5xl backdrop-blur">
        🏥
      </div>

      <h1 className="text-5xl font-extrabold leading-tight">
        Your health journey, connected.
      </h1>

      <p className="mt-6 max-w-md text-lg leading-8 text-blue-100">
        Manage appointments, connect with doctors, and keep your
        healthcare journey organized in one place.
      </p>

      <div className="mt-10 space-y-4">
        {[
          "Convenient appointment scheduling",
          "Organized medical records",
          "A connected healthcare experience",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">
              ✓
            </span>
            <span className="text-sm font-medium text-blue-50">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>

    <p className="relative z-10 text-sm text-blue-100">
      Smarter Healthcare. Seamless Care.
    </p>
  </section>

  {/* Right Side */}
  <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <span aria-hidden="true">←</span> Back to home
      </Link>

      <div className="mb-8 lg:hidden">
        <Link href="/" className="text-2xl font-extrabold">
          Cura<span className="text-blue-600">Sync</span>
        </Link>
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
          Welcome back
        </p>

        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          Sign in to CuraSync
        </h2>

        <p className="mt-3 leading-7 text-slate-500">
          Enter your details to access your healthcare portal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700"
            >
              Password
            </label>

            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              onClick={() =>
                setError(
                  "Password recovery has not been implemented yet."
                )
              }
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-20 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 hover:text-blue-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In →"}
        </button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-sm text-slate-400">
          New to CuraSync?
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <Link
        href="/register"
        className="block w-full rounded-xl border border-slate-200 px-5 py-3.5 text-center font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
      >
        Create an account
      </Link>

      <p className="mt-8 text-center text-xs leading-5 text-slate-400">
        CuraSync is a healthcare management project prototype. Do not
        enter real medical or sensitive personal information.
      </p>
    </div>
  </section>
</main>


);
}
