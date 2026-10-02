"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 font-black text-white shadow-lg shadow-orange-500/20">
              P
            </div>

            <div>
              <p className="text-lg font-black text-white">ParcelPilot</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-orange-400">
                Logistics
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link
              href="/"
              className="text-slate-300 transition hover:text-orange-400"
            >
              Home
            </Link>

            <Link
              href="/services"
              className="text-slate-300 transition hover:text-orange-400"
            >
              Services
            </Link>

            <Link href="/about" className="font-bold text-orange-400">
              About
            </Link>

            <Link
              href="/contact"
              className="text-slate-300 transition hover:text-orange-400"
            >
              Contact
            </Link>

            <Link
              href="/track"
              className="text-slate-300 transition hover:text-orange-400"
            >
              Track Shipment
            </Link>

            <Link
              href="/login"
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-white transition hover:bg-orange-400"
            >
              Staff Portal
            </Link>
          </nav>

          <Link
            href="/track"
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white md:hidden"
          >
            Track
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(249,115,22,0.25),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-400">
              About ParcelPilot
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Moving shipments forward with confidence.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              ParcelPilot provides modern logistics solutions designed to help
              businesses and customers move shipments efficiently across
              borders, cities, airports and delivery networks.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services"
                className="rounded-xl bg-orange-500 px-6 py-3.5 text-center font-bold text-white transition hover:bg-orange-400"
              >
                Explore Our Services
              </Link>

              <Link
                href="/track"
                className="rounded-xl border border-slate-600 px-6 py-3.5 text-center font-bold text-white transition hover:border-orange-500 hover:bg-orange-500/10"
              >
                Track a Shipment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Who We Are
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Logistics designed around visibility and reliability.
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              ParcelPilot is built around a simple idea: customers should have
              a clearer understanding of where their shipments are and what is
              happening at every stage of the journey.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              From collection and processing to transportation, customs,
              destination handling and final delivery, our platform brings
              important shipment information together in one place.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              Our approach combines transportation services with modern
              shipment tracking technology to provide a more connected
              logistics experience.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-950 p-7 text-white">
              <div className="text-3xl font-black text-orange-400">24/7</div>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                Shipment visibility
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-7">
              <div className="text-3xl font-black">Global</div>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                International logistics
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="text-3xl font-black">Live</div>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Location updates
              </p>
            </div>

            <div className="rounded-2xl bg-orange-500 p-7 text-white">
              <div className="text-3xl font-black">1 Platform</div>
              <p className="mt-2 text-sm font-semibold text-orange-100">
                Connected shipment information
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Our Mission
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Make every shipment easier to understand.
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Logistics can involve multiple locations, transportation
              methods, facilities and operational stages. ParcelPilot brings
              these stages together so shipment information can be presented
              clearly to customers and managed efficiently by operations teams.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <InfoCard
              icon="📍"
              title="Better Visibility"
              text="Keep important shipment locations and progress information accessible throughout the journey."
            />

            <InfoCard
              icon="✈️"
              title="Connected Transport"
              text="Support air, road and rail transportation as part of a connected logistics journey."
            />

            <InfoCard
              icon="✓"
              title="Clear Progress"
              text="Give customers a straightforward view of shipment stages from pickup through final delivery."
            />
          </div>
        </div>
      </section>

      {/* LOGISTICS NETWORK */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Our Logistics Network
          </p>

          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Air, road and rail working together.
          </h2>

          <p className="mt-5 leading-8 text-slate-600">
            Different shipments require different transportation solutions.
            ParcelPilot is structured around multiple logistics channels so
            shipments can move through the appropriate part of the network.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <NetworkCard
            image="/images/plane.jpg"
            title="Air Logistics"
            text="Designed for time-sensitive and international shipments traveling through airport and air freight networks."
          />

          <NetworkCard
            image="/images/bus.jpg"
            title="Road Logistics"
            text="Supports collection, regional transportation, destination handling and final-mile delivery."
          />

          <NetworkCard
            image="/images/train.jpg"
            title="Rail Logistics"
            text="Provides another transportation option for moving goods across connected regional and international networks."
          />
        </div>
      </section>

      {/* TRACKING */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
                Shipment Tracking
              </p>

              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                Know where your shipment is and what happens next.
              </h2>

              <p className="mt-6 leading-8 text-slate-300">
                ParcelPilot tracking is designed to show shipment progress in
                a simple, customer-friendly format. Customers can follow
                operational stages, view shipment information and see the
                latest available location.
              </p>

              <Link
                href="/track"
                className="mt-8 inline-flex rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white transition hover:bg-orange-400"
              >
                Track a Shipment
              </Link>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              {[
                ["Shipment Created", "Shipment information is registered."],
                ["In Transit", "The shipment is moving through the network."],
                ["Destination", "The shipment reaches its destination network."],
                ["Delivery", "Final-mile delivery completes the journey."],
              ].map(([title, text]) => (
                <div key={title} className="mb-7 flex gap-4 last:mb-0">
                  <div className="mt-2 h-3 w-3 shrink-0 rounded-full bg-orange-400" />

                  <div>
                    <p className="font-bold text-white">{title}</p>
                    <p className="mt-1 text-sm text-slate-400">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY PARCELPILOT */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Why ParcelPilot
          </p>

          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Built for customers and operations teams.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-slate-600">
            A professional logistics experience requires both customer
            visibility and operational control.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            title="Shipment Visibility"
            text="Customers can follow shipment progress through a dedicated tracking page."
          />

          <Feature
            title="Live Locations"
            text="Available location updates can be displayed on the shipment journey map."
          />

          <Feature
            title="Operational Control"
            text="Staff can manage shipments, stages, events and operational updates."
          />

          <Feature
            title="Connected Journey"
            text="Shipment events and locations can be connected into one understandable journey."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-orange-500 px-8 py-14 md:px-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-100">
                Follow Your Shipment
              </p>

              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                Your shipment journey, right in front of you.
              </h2>

              <p className="mt-4 leading-7 text-orange-50">
                Enter your ParcelPilot tracking number to view the latest
                shipment information and progress.
              </p>
            </div>

            <Link
              href="/track"
              className="rounded-xl bg-white px-7 py-3.5 text-center font-bold text-slate-900 transition hover:bg-slate-100"
            >
              Track Shipment
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Contact
              </p>

              <h2 className="mt-4 text-3xl font-black">
                Let&apos;s move forward.
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                For shipment questions, logistics enquiries or operational
                support, contact the ParcelPilot team.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Customer Support
              </p>

              <p className="mt-2 font-bold">
                Available for shipment enquiries
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">
                Shipment Tracking
              </p>

              <Link
                href="/track"
                className="mt-2 inline-block font-bold text-orange-500 hover:text-orange-600"
              >
                Track your shipment →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-black">
              <span className="text-white">Parcel</span>
              <span className="text-orange-500">Pilot</span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              International courier, express and logistics tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-slate-400">
            <Link href="/" className="transition hover:text-orange-400">
              Home
            </Link>

            <Link
              href="/services"
              className="transition hover:text-orange-400"
            >
              Services
            </Link>

            <Link href="/about" className="transition hover:text-orange-400">
              About
            </Link>

            <Link href="/track" className="transition hover:text-orange-400">
              Track Shipment
            </Link>
          </div>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} ParcelPilot Logistics
          </p>
        </div>
      </footer>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-xl">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-black">{title}</h3>

      <p className="mt-3 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function NetworkCard({
  image,
  title,
  text,
}: {
  image: string;
  title: string;
  text: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <img
        src={image}
        alt={title}
        className="h-56 w-full object-cover"
      />

      <div className="p-7">
        <h3 className="text-2xl font-black">{title}</h3>

        <p className="mt-3 leading-7 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function Feature({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-7">
      <div className="mb-4 h-1.5 w-10 rounded-full bg-orange-500" />

      <h3 className="text-lg font-black">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
    </div>
  );
}