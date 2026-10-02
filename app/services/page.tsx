import Link from "next/link";

const services = [
  {
    number: "01",
    title: "Air Freight",
    description:
      "International air freight coordination for time-sensitive shipments, with operator-published shipment status and location updates throughout the journey.",
    features: [
      "International air transportation",
      "Airport-to-airport logistics",
      "Published shipment updates",
      "Express international options",
    ],
    icon: "✈",
  },
  {
    number: "02",
    title: "Road Logistics",
    description:
      "Reliable road transportation for regional and domestic deliveries, connecting businesses and customers through coordinated ground logistics.",
    features: [
      "Domestic transportation",
      "Regional delivery networks",
      "Door-to-door service",
      "Shipment coordination",
    ],
    icon: "▰",
  },
  {
    number: "03",
    title: "Rail Logistics",
    description:
      "Rail transportation for suitable routes and larger shipments, providing an additional option for dependable long-distance logistics.",
    features: [
      "Long-distance rail transport",
      "Freight coordination",
      "Route management",
      "Shipment visibility",
    ],
    icon: "▤",
  },
  {
    number: "04",
    title: "Express Delivery",
    description:
      "Priority delivery solutions for shipments requiring faster handling and dependable movement through the logistics network.",
    features: [
      "Priority shipment handling",
      "Fast delivery options",
      "Shipment updates",
      "Flexible service levels",
    ],
    icon: "⚡",
  },
  {
    number: "05",
    title: "International Shipping",
    description:
      "End-to-end international shipment coordination connecting origins and destinations across borders with structured shipment visibility.",
    features: [
      "Cross-border shipping",
      "International route coordination",
      "Customs-stage visibility",
      "Shipment tracking",
    ],
    icon: "◎",
  },
  {
    number: "06",
    title: "Shipment Tracking",
    description:
      "A dedicated tracking experience that lets customers follow shipment status, published operational locations and the recorded shipment journey.",
    features: [
      "Tracking number lookup",
      "Published shipment locations",
      "Tracking history",
      "Delivery status visibility",
    ],
    icon: "⌖",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-lg font-black text-white shadow-lg shadow-orange-500/20">
              P
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-white">
                ParcelPilot
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-orange-400">
                Logistics
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-300 transition hover:text-orange-400"
            >
              Home
            </Link>

            <Link
              href="/services"
              className="text-sm font-bold text-orange-400"
            >
              Services
            </Link>

            <Link
              href="/about"
              className="text-sm font-semibold text-slate-300 transition hover:text-orange-400"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="text-sm font-semibold text-slate-300 transition hover:text-orange-400"
            >
              Contact
            </Link>

            <Link
              href="/track"
              className="text-sm font-semibold text-slate-300 transition hover:text-orange-400"
            >
              Track Shipment
            </Link>
          </nav>

          <Link
            href="/track"
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
          >
            Track Shipment
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.24),transparent_45%)]" />

        <div className="absolute -right-32 top-20 h-72 w-72 rounded-full border border-orange-500/10" />
        <div className="absolute -right-20 top-32 h-56 w-56 rounded-full border border-orange-500/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              ParcelPilot Logistics
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Logistics services built around your shipment.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              From international air freight to road transportation
              and shipment tracking, ParcelPilot provides coordinated
              logistics solutions for every stage of the delivery
              journey.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/track"
                className="rounded-xl bg-orange-500 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
              >
                Track a Shipment
              </Link>

              <Link
                href="/contact"
                className="rounded-xl border border-slate-600 px-6 py-3.5 text-center text-sm font-bold text-white transition hover:border-orange-500/50 hover:bg-orange-500/10"
              >
                Contact ParcelPilot
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Our Services
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Transportation and delivery solutions
          </h2>

          <p className="mt-5 leading-8 text-slate-600">
            ParcelPilot brings together transportation, shipment
            coordination and tracking technology to help customers
            stay informed from pickup through final delivery.
          </p>
        </div>

        {/* SERVICE GRID */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.number}
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-xl text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                  {service.icon}
                </div>

                <span className="text-sm font-black text-slate-300">
                  {service.number}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-black text-slate-950">
                {service.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {service.description}
              </p>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                  Service includes
                </p>

                <ul className="mt-4 space-y-3">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-slate-600"
                    >
                      <span className="mt-0.5 font-black text-orange-500">
                        ✓
                      </span>

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TRACKING EXPLANATION */}
      <section className="border-y border-slate-200 bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
              Shipment Visibility
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Follow the shipment journey with published updates.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Each shipment can be updated through the ParcelPilot
              operational system. Customers can use their tracking
              number to view the latest available status, published
              location and recorded shipment history.
            </p>

            <Link
              href="/track"
              className="mt-8 inline-flex rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
            >
              View Tracking →
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Tracking System
                </p>

                <p className="mt-2 text-lg font-black text-white">
                  Operational Shipment Updates
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-xl text-orange-400">
                ⌖
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <VisibilityItem
                title="Shipment Status"
                text="Current operational stage"
              />

              <VisibilityItem
                title="Published Location"
                text="Latest available operational coordinates"
              />

              <VisibilityItem
                title="Tracking History"
                text="Recorded shipment events and updates"
              />

              <VisibilityItem
                title="Delivery Progress"
                text="Journey progress through destination"
              />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              How It Works
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              From pickup to delivery
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              ParcelPilot organizes shipment information into a
              clear journey that customers can follow through their
              tracking number.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <ProcessStep
              number="01"
              title="Pickup"
              text="Your shipment is collected and registered in the ParcelPilot system."
            />

            <ProcessStep
              number="02"
              title="Transit"
              text="The shipment moves through the appropriate transportation network."
            />

            <ProcessStep
              number="03"
              title="Tracking"
              text="Customers can follow shipment status and available published location updates."
            />

            <ProcessStep
              number="04"
              title="Delivery"
              text="The shipment reaches its destination and the delivery status is recorded."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-500">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-100">
                Ready to track?
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
                Follow your shipment from anywhere.
              </h2>

              <p className="mt-3 leading-7 text-orange-50">
                Enter your ParcelPilot tracking number to view the
                latest available shipment information and published
                operational updates.
              </p>
            </div>

            <Link
              href="/track"
              className="shrink-0 rounded-xl bg-white px-6 py-3.5 text-center text-sm font-bold text-orange-600 transition hover:bg-orange-50"
            >
              Track Shipment
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <div className="text-2xl font-black">
                <span className="text-white">Parcel</span>
                <span className="text-orange-500">Pilot</span>
              </div>

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                International courier, express and logistics tracking
                with operator-published shipment updates.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Navigation
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                <Link
                  href="/"
                  className="transition hover:text-orange-400"
                >
                  Home
                </Link>

                <Link
                  href="/services"
                  className="transition hover:text-orange-400"
                >
                  Services
                </Link>

                <Link
                  href="/about"
                  className="transition hover:text-orange-400"
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className="transition hover:text-orange-400"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Tracking
              </p>

              <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
                <Link
                  href="/track"
                  className="transition hover:text-orange-400"
                >
                  Track Shipment
                </Link>

                <Link
                  href="/login"
                  className="transition hover:text-orange-400"
                >
                  Staff Portal
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
            © {new Date().getFullYear()} ParcelPilot Logistics
          </div>
        </div>
      </footer>
    </main>
  );
}

function VisibilityItem({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-sm font-black text-orange-400">
        ✓
      </div>

      <div>
        <p className="text-sm font-bold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="relative">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-600">
        {number}
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>
    </div>
  );
}