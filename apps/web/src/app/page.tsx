import Link from "next/link";
import {
  Sprout,
  LayoutGrid,
  Zap,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight,
  Shield,
  GitBranch,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";

/* ─── Data ───────────────────────────────────────────── */
const features = [
  {
    icon: LayoutGrid,
    title: "Kanban Boards",
    description:
      "Drag-and-drop task boards keep every sprint visible and every blocker surfaced instantly.",
    color: "bg-emerald-50 text-emerald-600",
    border: "group-hover:border-emerald-300",
  },
  {
    icon: Zap,
    title: "Sprint Management",
    description:
      "Plan, start, and close sprints with full lifecycle control, velocity tracking, and goals.",
    color: "bg-sky-50 text-sky-600",
    border: "group-hover:border-sky-300",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Burndown charts, Gantt timelines, Pareto, PERT, and control charts — built in, always live.",
    color: "bg-teal-50 text-teal-600",
    border: "group-hover:border-teal-300",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite members, assign roles (Scrum Master, Developer, Supervisor), and manage permissions.",
    color: "bg-amber-50 text-amber-600",
    border: "group-hover:border-amber-300",
  },
  {
    icon: GitBranch,
    title: "Backlog & Prioritisation",
    description:
      "Manage your product backlog, assign story points, and move tasks into the right sprint.",
    color: "bg-stone-100 text-stone-600",
    border: "group-hover:border-stone-300",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description:
      "Fine-grained permissions keep the right people in control without exposing sensitive data.",
    color: "bg-emerald-50 text-emerald-600",
    border: "group-hover:border-emerald-300",
  },
];

const steps = [
  {
    n: "01",
    title: "Create a project",
    body: "Name your project and set a description. Takes under 30 seconds.",
  },
  {
    n: "02",
    title: "Invite your team",
    body: "Add developers and assign their roles — Developer, Scrum Master, or Supervisor.",
  },
  {
    n: "03",
    title: "Plan sprints",
    body: "Populate your backlog, set story points, and drag tasks into sprints.",
  },
  {
    n: "04",
    title: "Ship & measure",
    body: "Track velocity with burndown charts and delivery analytics in real time.",
  },
];

const stats = [
  { value: "10k+", label: "Tasks managed" },
  { value: "500+", label: "Active teams" },
  { value: "99.9%", label: "Uptime SLA" },
];

/* ─── Mock kanban data ───────────────────────────────── */
const kanbanMock = [
  {
    col: "To Do",
    dot: "bg-stone-400",
    count: 3,
    cards: [
      { title: "Design system audit", tags: ["Med"] },
      { title: "API documentation", tags: ["Low"] },
      { title: "OAuth integration", tags: ["High"] },
    ],
  },
  {
    col: "In Progress",
    dot: "bg-sky-500",
    count: 2,
    cards: [
      { title: "Sprint planning board", tags: ["High"] },
      { title: "Auth module refactor", tags: ["Med"] },
    ],
  },
  {
    col: "In Review",
    dot: "bg-amber-500",
    count: 1,
    cards: [{ title: "Database schema v2", tags: ["High"] }],
  },
  {
    col: "Done",
    dot: "bg-emerald-500",
    count: 3,
    cards: [
      { title: "Project setup", tags: ["Low"] },
      { title: "CI/CD pipeline", tags: ["Med"] },
      { title: "Design tokens", tags: ["Low"] },
    ],
  },
];

const TAG_COLOR: Record<string, string> = {
  High: "bg-red-50 text-red-700",
  Med: "bg-amber-50 text-amber-700",
  Low: "bg-emerald-50 text-emerald-700",
};

/* ─── Page ───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-stone-900 overflow-x-hidden">
      {/* ── Navbar ───────────────────────────────────── */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-stone-900 text-lg tracking-tight">
              Agile PM
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="btn-primary py-1.5 px-4 text-sm hidden sm:inline-flex"
            >
              Get started
            </Link>
            <Link
              href="/register"
              className="btn-primary py-1.5 px-3 text-sm sm:hidden"
            >
              Start
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden bg-stone-50">
        {/* Dot grid background */}
        <div className="absolute inset-0 bg-dots opacity-60 pointer-events-none" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-50/0 via-stone-50/40 to-stone-50 pointer-events-none" />

        {/* Decorative blobs */}
        <div className="absolute top-20 -left-24 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -right-16 w-56 h-56 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Pill badge */}
          <div className="animate-fade-in flex justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              Built for Agile engineering teams
            </div>
          </div>

          {/* Headline */}
          <div className="text-center">
            <h1 className="font-display font-bold text-stone-900 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-tight animate-fade-in-up">
              The smarter way
              <br />
              to{" "}
              <span className="relative inline-block">
                <span className="text-gradient">manage projects</span>
              </span>
            </h1>

            <p className="mt-5 sm:mt-6 text-base sm:text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-150">
              Agile PM brings Kanban boards, sprint management, and deep
              analytics together — so your team can focus on shipping, not
              tracking.
            </p>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up delay-300">
              <Link
                href="/register"
                className="btn-primary px-6 py-3 text-base w-full sm:w-auto"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="btn-secondary px-6 py-3 text-base w-full sm:w-auto"
              >
                Sign in to workspace
              </Link>
            </div>

            {/* Trust note */}
            <p className="mt-4 text-xs text-stone-400 animate-fade-in delay-500">
              No credit card required · Free to start
            </p>
          </div>

          {/* Stats strip */}
          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in-up delay-400">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display font-bold text-2xl sm:text-3xl text-stone-900">
                  {value}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Hero kanban mock */}
          <div className="mt-12 sm:mt-16 animate-fade-in-up delay-500">
            <div className="relative mx-auto max-w-5xl">
              {/* Glow behind the card */}
              <div className="absolute inset-x-8 -bottom-6 h-16 bg-emerald-400/20 blur-2xl rounded-full" />

              <div className="relative rounded-2xl border border-stone-300/80 shadow-hero overflow-hidden bg-white animate-float">
                {/* Window chrome */}
                <div className="bg-stone-100/80 border-b border-stone-200 px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 bg-stone-200/60 rounded h-4 max-w-xs mx-auto" />
                  <div className="w-16 h-4 bg-stone-200/60 rounded" />
                </div>

                {/* Kanban board */}
                <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-stone-50/50">
                  {kanbanMock.map(({ col, dot, count, cards }) => (
                    <div
                      key={col}
                      className="rounded-xl border border-stone-200 bg-white overflow-hidden"
                    >
                      <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-stone-100">
                        <span
                          className={`w-2 h-2 rounded-full ${dot} shrink-0`}
                        />
                        <span className="text-xs font-semibold text-stone-700 flex-1 truncate">
                          {col}
                        </span>
                        <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                          {count}
                        </span>
                      </div>
                      <div className="p-1.5 space-y-1.5">
                        {cards.map((card) => (
                          <div
                            key={card.title}
                            className="bg-white rounded-lg border border-stone-200 p-2"
                          >
                            <p className="text-[10px] sm:text-xs text-stone-700 font-medium leading-snug line-clamp-2">
                              {card.title}
                            </p>
                            <div className="mt-1.5 flex gap-1">
                              {card.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className={`text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded ${TAG_COLOR[tag] ?? "bg-stone-100 text-stone-600"}`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">
              Features
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-stone-900">
              Everything your team needs
            </h2>
            <p className="mt-4 text-stone-500 text-base sm:text-lg max-w-xl mx-auto">
              A complete Agile toolkit — from backlog grooming to delivery
              analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map(
              ({ icon: Icon, title, description, color, border }) => (
                <div
                  key={title}
                  className={`group rounded-xl border border-stone-200 p-5 sm:p-6 transition-all duration-200 hover:shadow-card-hover ${border} cursor-default`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-2 text-sm sm:text-base">
                    {title}
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {description}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-stone-50 bg-dots-light relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-stone-50/80 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">
              Process
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-stone-900">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ n, title, body }, i) => (
              <div key={n} className="relative">
                {/* Connector line (hidden on mobile) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%-8px)] w-full h-px bg-emerald-200 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold font-display mb-4 shadow-sm">
                    {n}
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-2 text-sm sm:text-base">
                    {title}
                  </h3>
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────── */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-emerald-700" />
        <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-teal-400/30 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
            Ready to ship faster?
          </h2>
          <p className="mt-4 text-emerald-100 text-base sm:text-lg max-w-xl mx-auto">
            Join hundreds of teams already delivering better software with Agile
            PM.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-6 py-3 rounded-lg hover:bg-emerald-50 active:scale-[0.98] transition-all w-full sm:w-auto justify-center"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-emerald-100 hover:text-white transition-colors py-3 px-2"
            >
              Already have an account? Sign in →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="bg-white border-t border-stone-200 py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center">
              <Sprout className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-stone-800 text-sm">
              Agile PM
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-400">
            <Link
              href="/login"
              className="hover:text-stone-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="hover:text-stone-700 transition-colors"
            >
              Register
            </Link>
            <span>© {new Date().getFullYear()} Agile PM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
