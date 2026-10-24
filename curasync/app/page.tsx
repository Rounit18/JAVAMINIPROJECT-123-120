import Link from "next/link";

const features = [
  {
    icon: "🩺",
    title: "Find Your Doctor",
    description:
      "Discover doctors by specialty and explore their appointment availability.",
    color: "bg-blue-50",
  },
  {
    icon: "📅",
    title: "Easy Appointments",
    description:
      "Explore available dates and time slots to plan your next visit.",
    color: "bg-emerald-50",
  },
  {
    icon: "📋",
    title: "Medical Records",
    description:
      "Access your medical history and prescriptions through a secure portal.",
    color: "bg-violet-50",
  },
  {
    icon: "⏱️",
    title: "Smart Queue",
    description:
      "Get helpful updates about appointments and estimated waiting times.",
    color: "bg-amber-50",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
              ✚
            </div>

            <div>
              <p className="text-xl font-extrabold">
                Cura<span className="text-blue-600">Sync</span>
              </p>
              <p className="text-xs text-slate-500">
                Smarter healthcare
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#home" className="text-sm hover:text-blue-600">
              Home
            </a>
            <a href="#services" className="text-sm hover:text-blue-600">
              Services
            </a>
            <a href="#about" className="text-sm hover:text-blue-600">
              About
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-block"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="bg-gradient-to-br from-blue-50 via-white to-cyan-50"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              A smarter way to manage healthcare
            </div>

            <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Your health,
              <br />
              <span className="text-blue-600">our priority.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Healthcare made simpler. Discover doctors, schedule
              appointments, and keep your medical journey organized
              in one convenient place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
              >
                Book an Appointment →
              </Link>

              <a
                href="#services"
                className="rounded-xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-700 hover:border-blue-300"
              >
                Explore Services
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-200 pt-7">
              <div>
                <p className="text-xl font-extrabold">24/7</p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Online access
                </p>
              </div>

              <div>
                <p className="text-xl font-extrabold">One place</p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Connected care
                </p>
              </div>

              <div>
                <p className="text-xl font-extrabold">Patient-first</p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Designed for you
                </p>
              </div>
            </div>
          </div>

          {/* Healthcare Dashboard Illustration */}
          <div className="mx-auto w-full max-w-lg">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-blue-100 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Welcome to
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold">
                    Your Care Hub
                  </h2>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  🏥
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
                <p className="text-sm text-blue-100">
                  Your healthcare journey
                </p>

                <h3 className="mt-2 text-2xl font-bold">
                  Starts right here.
                </h3>

                <p className="mt-3 text-sm leading-6 text-blue-50">
                  Appointments, records, and care in one connected
                  experience.
                </p>

                <div className="mt-5 text-4xl">💙</div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <div className="text-3xl">📅</div>
                  <h3 className="mt-4 font-bold">
                    Appointments
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    Find a convenient time.
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-5">
                  <div className="text-3xl">🩺</div>
                  <h3 className="mt-4 font-bold">
                    Your Doctors
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    Connect with your care team.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-emerald-600">
                  ✓
                </div>

                <div>
                  <p className="font-bold text-emerald-900">
                    Care, connected
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    A simpler healthcare experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-white px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Healthcare, simplified
            </p>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Everything you need, in one place.
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              CuraSync brings essential hospital services together
              in one thoughtfully designed platform.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} text-3xl`}
                >
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 pb-20">
        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-950 px-8 py-12 sm:px-12 sm:py-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
                The future of connected care
              </p>

              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Better coordination.
                <br />
                A better healthcare experience.
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                One platform designed to bring patients, doctors,
                and hospital teams closer together.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-block self-start rounded-xl bg-white px-6 py-4 font-bold text-slate-950 hover:bg-blue-50 md:self-center"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-xl font-extrabold">
            Cura<span className="text-blue-600">Sync</span>
          </Link>

          <p className="text-sm text-slate-500">
            Smarter Healthcare. Seamless Care.
          </p>

          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} CuraSync. College project prototype.
          </p>
        </div>
      </footer>
    </main>
  );
}