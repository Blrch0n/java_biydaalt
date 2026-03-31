import Link from "next/link";

const cards = [
  {
    href: "/students",
    title: "Students",
    description: "View all students and add new student records.",
  },
  {
    href: "/courses",
    title: "Courses",
    description: "Manage courses, pricing, and lesson content.",
  },
  {
    href: "/enrollments",
    title: "Enrollments",
    description: "Track enrollment history and update progress.",
  },
  {
    href: "/enroll",
    title: "Enroll Student",
    description: "Assign a student to a course in one form.",
  },
];

export default function Home() {
  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
          School Project Dashboard
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-poppins)] text-3xl font-semibold text-slate-900 sm:text-4xl">
          Online Learning System
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Manage students, courses, lessons, and enrollments from one clean
          interface connected to your Spring Boot backend.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow"
          >
            <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-slate-900 group-hover:text-sky-700">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
