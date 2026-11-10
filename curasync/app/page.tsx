import Link from "next/link";

const roles = [
  {
    title: "Patient",
    description:
      "Book appointments, manage your health records, and stay connected with your doctors.",
    icon: "🧑‍⚕️",
    href: "/login",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
  },
  {
    title: "Doctor",
    description:
      "Manage your appointments, view patients, and coordinate their treatment.",
    icon: "🩺",
    href: "/doctor/login",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
  },
  {
    title: "Receptionist",
    description:
      "Manage patient registrations, appointments, and hospital operations.",
    icon: "🏥",
    href: "/receptionist/login",
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-200">
              ✚
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Cura<span className="text-blue-600">Sync</span>
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Smarter Healthcare
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">
              Connected Care Portal
            </span>
          </div>
        </div>
      </header>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
              <span>✦</span>
              Welcome to CuraSync
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Healthcare,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                connected seamlessly.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Your care journey starts here. Choose your portal to access
              appointments, medical records, and personalized healthcare
              services.
            </p>
          </div>

          <div className="mt-14">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold">How would you like to continue?</h3>
              <p className="mt-2 text-sm text-slate-500">
                Select your role to enter the appropriate portal.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {roles.map((role) => (
                <Link
                  key={role.title}
                  href={role.href}
                  className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100"
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${role.bg} text-4xl transition duration-300 group-hover:scale-110`}
                  >
                    {role.icon}
                  </div>

                  <h4 className="mt-6 text-2xl font-extrabold">
                    {role.title}
                  </h4>

                  <p className="mt-3 min-h-[84px] text-sm leading-6 text-slate-600">
                    {role.description}
                  </p>

                  <div
                    className={`mt-7 flex items-center justify-between rounded-xl bg-gradient-to-r ${role.color} px-5 py-3 font-semibold text-white shadow-md`}
                  >
                    <span>Enter {role.title} Portal</span>
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="text-emerald-500">✓</span>
              Secure access to your healthcare portal
            </div>

            <p className="text-xs text-slate-400">
              CuraSync · Smarter Healthcare. Seamless Care.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm font-bold">
            Cura<span className="text-blue-600">Sync</span>
          </p>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} CuraSync. College project prototype.
          </p>
        </div>
      </footer>
    </main>
  );
}