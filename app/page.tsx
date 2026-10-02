"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const services = [
  {
    title: "Air Freight",
    description:
      "Fast international air transportation for time-sensitive shipments.",
    icon: "✈",
  },
  {
    title: "Road Logistics",
    description:
      "Reliable road transportation with coordinated pickup and delivery.",
    icon: "▰",
  },
  {
    title: "Express Delivery",
    description:
      "Priority delivery services designed for urgent shipments.",
    icon: "⚡",
  },
  {
    title: "Live Tracking",
    description:
      "Follow shipment progress and operational locations online.",
    icon: "⌖",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your shipment",
    description:
      "Our operations team records your shipment details and destination.",
  },
  {
    number: "02",
    title: "Track every stage",
    description:
      "Monitor shipment progress from pickup through transportation and delivery.",
  },
  {
    number: "03",
    title: "Receive your delivery",
    description:
      "Your shipment arrives at its destination with a clear delivery history.",
  },
];

const brands = [
  "Camion Transport",
  "TFI International",
  "Green Cargo",
  "TNT Post",
  "Maersk",
];

const shippingUpdates = [
  {
    label: "Air Network",
    title: "International air movement",
    text: "Time-sensitive shipments can move through coordinated international air transportation.",
    icon: "✈",
  },
  {
    label: "Road Network",
    title: "Connected road logistics",
    text: "Road transportation supports coordinated pickup, transit and final-mile delivery.",
    icon: "▰",
  },
  {
    label: "Rail Network",
    title: "Structured rail movement",
    text: "Selected routes can use rail transportation as part of a connected logistics journey.",
    icon: "▤",
  },
];

const testimonials = [
  {
    quote:
      "ParcelPilot gives our team a much clearer view of shipment progress from dispatch through final delivery.",
    name: "Daniel Carter",
    role: "Operations Manager",
    company: "Global Trade Solutions",
  },
  {
    quote:
      "Having shipment updates and tracking information in one place makes it much easier to keep customers informed.",
    name: "Sophia Martin",
    role: "Customer Service Manager",
    company: "Northstar Distribution",
  },
  {
    quote:
      "The tracking experience gives our logistics team a simple way to follow shipments and communicate delivery updates.",
    name: "Michael Okafor",
    role: "Logistics Coordinator",
    company: "TransAfrica Freight",
  },
];

const faqs = [
  {
    question: "How do I track my shipment?",
    answer:
      "Enter your ParcelPilot tracking number in the tracking form. You will be taken to the shipment tracking page where available status and location information can be displayed.",
  },
  {
    question: "What does a ParcelPilot tracking number look like?",
    answer:
      "ParcelPilot tracking numbers use the PP prefix followed by a shipment number, for example PP900002.",
  },
  {
    question: "Can I track a shipment internationally?",
    answer:
      "Yes. ParcelPilot is designed to provide shipment visibility across international transportation and logistics journeys.",
  },
  {
    question: "Does tracking show shipment location?",
    answer:
      "When location information has been recorded for a shipment, the tracking experience can display available location and movement information.",
  },
];

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState("");

  function handleTracking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = trackingNumber.trim();

    if (!value) {
      return;
    }

    window.location.href = "/track/" + encodeURIComponent(value);
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-black text-white shadow-sm">
              P
            </div>

            <div>
              <div className="text-xl font-black tracking-tight">
                ParcelPilot
              </div>

              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600">
                Logistics
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            <Link
              href="/"
              className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-950"
            >
              Home
            </Link>

            <Link
              href="/services"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Services
            </Link>

            <Link
              href="/about"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Contact
            </Link>

            <Link
              href="/track"
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Track Shipment
            </Link>

            <Link
              href="/login"
              className="ml-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Staff Portal
            </Link>
          </nav>

          <Link
            href="/track"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 lg:hidden"
          >
            Track
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.3),_transparent_38%)]" />
        <div className="absolute -left-32 top-40 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div className="pp-slide-image">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              International courier & logistics
            </div>

            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Every delivery.
              <span className="block text-blue-400">
                Right on track.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              ParcelPilot helps businesses and customers move shipments
              across borders with reliable logistics, clear shipment
              visibility, and live tracking.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/track"
                className="rounded-xl bg-blue-600 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
              >
                Track a Shipment
              </Link>

              <Link
                href="/services"
                className="rounded-xl border border-slate-700 bg-white/5 px-6 py-3.5 text-center text-sm font-bold text-white transition hover:bg-white/10"
              >
                Explore Services
              </Link>
            </div>
          </div>

          <div className="pp-motion-card rounded-3xl border border-white/10 bg-white p-7 shadow-2xl">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Shipment tracking
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Where is your shipment?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your ParcelPilot tracking number to view shipment
                progress and location.
              </p>
            </div>

            <form onSubmit={handleTracking}>
              <label
                htmlFor="tracking-number"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Tracking number
              </label>

              <input
                id="tracking-number"
                type="text"
                value={trackingNumber}
                onChange={(event) =>
                  setTrackingNumber(event.target.value)
                }
                placeholder="Example: PP900002"
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="submit"
                className="mt-3 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-600"
              >
                Track Shipment
              </button>
            </form>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-200 pt-6">
              <div>
                <p className="text-xl font-black text-slate-950">24/7</p>
                <p className="text-xs font-medium text-slate-500">
                  Visibility
                </p>
              </div>

              <div>
                <p className="text-xl font-black text-slate-950">Global</p>
                <p className="text-xs font-medium text-slate-500">
                  Network
                </p>
              </div>

              <div>
                <p className="text-xl font-black text-slate-950">Live</p>
                <p className="text-xs font-medium text-slate-500">
                  Tracking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
          <div className="px-6 py-8 text-center">
            <p className="text-3xl font-black">24/7</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Shipment visibility
            </p>
          </div>

          <div className="px-6 py-8 text-center">
            <p className="text-3xl font-black">Global</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              International movement
            </p>
          </div>

          <div className="px-6 py-8 text-center">
            <p className="text-3xl font-black">Live</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Location updates
            </p>
          </div>

          <div className="px-6 py-8 text-center">
            <p className="text-3xl font-black">Secure</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Operational control
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Trusted by Global Brands
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Connected to the logistics environment.
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              ParcelPilot works across a connected logistics environment,
              supporting shipment movement through trusted transportation,
              freight and logistics partners.
            </p>
          </div>

          <div className="relative mt-10 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

            <div className="pp-marquee flex w-max items-center gap-5">
              {[...brands, ...brands].map((brand, index) => (
                <div
                  key={`${brand}-${index}`}
                  className="flex min-w-[210px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-7 py-6"
                >
                  <span className="text-lg font-black tracking-tight text-slate-800">
                    {brand}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Our services
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Logistics built around visibility.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              From international transportation to final-mile delivery,
              ParcelPilot gives customers and operations teams a clearer
              view of every shipment.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`pp-motion-card rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  index % 2 === 0 ? "pp-image-zoom" : "pp-image-pan"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                  {service.icon}
                </div>

                <h3 className="mt-6 text-xl font-black">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>

                <Link
                  href="/services"
                  className="mt-6 inline-flex text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="pp-slide-image">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                How it works
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight">
                From pickup to delivery.
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                ParcelPilot keeps the shipment journey organized from the
                moment a package enters the network until it reaches its
                destination.
              </p>

              <Link
                href="/track"
                className="mt-8 inline-flex rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-600"
              >
                View Tracking
              </Link>
            </div>

            <div className="space-y-5">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`pp-motion-card flex gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 ${
                    index === 1 ? "pp-floating-card" : ""
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="text-lg font-black">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-slate-950 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
                Global movement
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight text-white">
                One platform for every shipment journey.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
                Track international shipments, monitor operational
                locations, and keep important delivery information
                accessible from one place.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="pp-motion-card rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="font-black text-white">Air Logistics</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    International air freight and express transportation.
                  </p>
                </div>

                <div className="pp-motion-card rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="font-black text-white">Road Logistics</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Coordinated road movement and final-mile delivery.
                  </p>
                </div>

                <div className="pp-motion-card rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="font-black text-white">Rail Logistics</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Structured rail transportation for selected routes.
                  </p>
                </div>

                <div className="pp-motion-card rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="font-black text-white">Live Tracking</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Shipment status and location visibility online.
                  </p>
                </div>
              </div>
            </div>

            <div className="pp-image-pan rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 to-slate-900 p-8">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Shipment network
                    </p>

                    <p className="mt-2 text-2xl font-black text-white">
                      Connected movement
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    ●
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <div className="h-px flex-1 bg-slate-700" />
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <div className="h-px flex-1 bg-slate-700" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>

                  <div className="grid grid-cols-3 text-center text-xs font-semibold text-slate-400">
                    <span>Origin</span>
                    <span>Transit</span>
                    <span>Destination</span>
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-slate-700 bg-slate-950 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-400">
                      Visibility
                    </span>

                    <span className="text-sm font-bold text-emerald-400">
                      Active
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-3/4 rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Latest Shipping Information
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Stay connected to the movement.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Explore the transportation environments that support
              shipment movement through the ParcelPilot platform.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {shippingUpdates.map((item, index) => (
              <article
                key={item.title}
                className={`pp-motion-card overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 ${
                  index === 1 ? "pp-floating-card" : ""
                }`}
              >
                <div className="pp-image-zoom flex h-36 items-center justify-center bg-slate-950 text-5xl text-blue-400">
                  {item.icon}
                </div>

                <div className="p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                    {item.label}
                  </p>

                  <h3 className="mt-3 text-xl font-black">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Customer stories
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              What customers value about ParcelPilot.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
              Sample customer feedback illustrating the ParcelPilot experience.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item, index) => (
              <div
                key={`${item.name}-${item.company}`}
                className={`pp-motion-card rounded-3xl border border-slate-200 bg-white p-7 shadow-sm ${
                  index === 1 ? "pp-floating-card" : ""
                }`}
              >
                <div className="text-3xl font-black text-blue-600">
                  “
                </div>

                <p className="mt-3 text-base leading-7 text-slate-700">
                  {item.quote}
                </p>

                <div className="mt-7 border-t border-slate-200 pt-5">
                  <p className="font-black text-slate-950">
                    {item.name}
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {item.role}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* GLOBAL LOGISTICS SHOWCASE */}
      <section className="border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
                Global logistics network
              </p>

              <h2 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Moving shipments across borders, cities and networks.
              </h2>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
                From international freight and warehouse handling to road transportation
                and final-mile delivery, ParcelPilot brings the shipment journey together
                in one clear tracking experience.
              </p>
            </div>

            <div className="lg:col-span-5 lg:text-right">
              <Link
                href="/services"
                className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
              >
                Explore logistics services
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            <div className="group relative overflow-hidden rounded-3xl bg-slate-950 shadow-xl lg:col-span-7">
              <img
                src="/images/parcelpilot/hero-logistics.jpg"
                alt="ParcelPilot logistics and transportation operations"
                className="h-[360px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[440px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
                  International logistics
                </span>

                <h3 className="mt-3 max-w-xl text-2xl font-black text-white sm:text-3xl">
                  Visibility from origin to destination.
                </h3>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200 sm:text-base">
                  Keep shipment information clear as cargo moves through the
                  transportation network.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5">
              <div className="group overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-200">
                <div className="overflow-hidden">
                  <img
                    src="/images/parcelpilot/air-freight.jpg"
                    alt="Air freight transportation"
                    className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Air freight
                  </p>

                  <h3 className="mt-2 text-lg font-black text-slate-950">
                    International movement
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Time-sensitive shipments moving across borders and continents.
                  </p>
                </div>
              </div>

              <div className="group overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-200">
                <div className="overflow-hidden">
                  <img
                    src="/images/parcelpilot/warehouse.jpg"
                    alt="Modern logistics warehouse"
                    className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Warehousing
                  </p>

                  <h3 className="mt-2 text-lg font-black text-slate-950">
                    Organized handling
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Shipment handling and dispatch organized around visibility.
                  </p>
                </div>
              </div>

              <div className="group overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-200">
                <div className="overflow-hidden">
                  <img
                    src="/images/parcelpilot/truck.jpg"
                    alt="Parcel delivery truck on the road"
                    className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Road network
                  </p>

                  <h3 className="mt-2 text-lg font-black text-slate-950">
                    Reliable ground movement
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Coordinated transportation from pickup through final mile.
                  </p>
                </div>
              </div>

              <div className="group overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-200">
                <div className="overflow-hidden">
                  <img
                    src="/images/parcelpilot/container-yard.jpg"
                    alt="Shipping containers at a logistics facility"
                    className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Global freight
                  </p>

                  <h3 className="mt-2 text-lg font-black text-slate-950">
                    International shipping
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Freight movement across major logistics routes and facilities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="group relative overflow-hidden rounded-3xl bg-slate-950">
              <img
                src="/images/parcelpilot/delivery.jpg"
                alt="Courier completing a delivery"
                className="h-64 w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/30 to-transparent" />

              <div className="absolute inset-y-0 left-0 flex max-w-md flex-col justify-center p-7 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                  Final mile
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  Delivery customers can follow.
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Give customers a clearer view as shipments approach their destination.
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-slate-950">
              <img
                src="/images/parcelpilot/warehouse-operations.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />

              <div className="absolute inset-0 bg-slate-950/75" />

              <div className="relative flex h-full min-h-64 flex-col justify-center p-7 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                  Built around your shipment
                </p>

                <h3 className="mt-3 max-w-lg text-2xl font-black text-white sm:text-3xl">
                  A clearer logistics experience from first scan to final delivery.
                </h3>

                <div className="mt-7 grid max-w-md grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-2xl font-black text-white">24/7</p>
                    <p className="mt-1 text-xs text-slate-300">Shipment visibility</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <p className="text-2xl font-black text-white">Global</p>
                    <p className="mt-1 text-xs text-slate-300">Logistics coverage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGISTICS SERVICES */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">
              Logistics services
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              More than tracking. A complete delivery experience.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Explore transportation and delivery services designed around
              shipment visibility and customer communication.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="overflow-hidden">
                <img
                  src="/images/parcelpilot/air-freight-real.jpg"
                  alt="Cargo aircraft being loaded for air freight"
                  className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Air freight
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-950">
                  Fast international movement
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Designed for shipments moving across borders and continents.
                </p>
              </div>
            </div>

            <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="overflow-hidden">
                <img
                  src="/images/parcelpilot/sea-freight.jpg"
                  alt="Cargo ship transporting freight by sea"
                  className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Sea freight
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-950">
                  Global ocean transportation
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Move cargo across international ports and major shipping routes.
                </p>
              </div>
            </div>

            <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="overflow-hidden">
                <img
                  src="/images/parcelpilot/fulfillment.jpg"
                  alt="Shipment fulfillment and package handling"
                  className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Fulfillment
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-950">
                  Organized package handling
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Keep shipments moving through organized handling and dispatch.
                </p>
              </div>
            </div>

            <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="overflow-hidden">
                <img
                  src="/images/parcelpilot/package-delivery.jpg"
                  alt="Package delivery"
                  className="h-52 w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Express delivery
                </p>

                <h3 className="mt-2 text-xl font-black text-slate-950">
                  A better final mile
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Keep customers informed as their shipment approaches its destination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LARGE FREIGHT BANNER */}
      <section className="relative overflow-hidden">
        <img
          src="/images/parcelpilot/port-logistics.jpg"
          alt="International freight and container logistics"
          className="h-[460px] w-full object-cover sm:h-[520px]"
        />

        <div className="absolute inset-0 bg-slate-950/60" />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-300">
                Global movement
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Wherever the shipment goes, keep the customer informed.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-200">
                ParcelPilot brings shipment information, operational updates and
                customer visibility together in one experience.
              </p>

              <Link
                href="/track"
                className="mt-8 inline-flex items-center rounded-xl bg-white px-6 py-3 font-bold text-slate-950 shadow-lg transition hover:bg-slate-100"
              >
                Track a shipment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Frequently Asked Questions
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Questions about shipment tracking?
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <summary className="cursor-pointer list-none pr-8 text-lg font-black text-slate-950">
                  <span className="flex items-center justify-between gap-5">
                    {faq.question}
                    <span className="text-2xl text-blue-600 transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-6 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Need to find a shipment?
            </h2>

            <p className="mt-3 max-w-2xl text-blue-100">
              Enter your ParcelPilot tracking number and view the latest
              shipment information.
            </p>
          </div>

          <Link
            href="/track"
            className="shrink-0 rounded-xl bg-white px-7 py-3.5 text-sm font-black text-blue-700 transition hover:bg-blue-50"
          >
            Track Your Shipment
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="text-xl font-black text-white">
                ParcelPilot
              </Link>

              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                Logistics
              </p>

              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                International courier and logistics with clear shipment
                visibility.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white">Company</h3>

              <div className="mt-4 space-y-3 text-sm">
                <Link href="/about" className="block hover:text-white">
                  About
                </Link>

                <Link href="/services" className="block hover:text-white">
                  Services
                </Link>

                <Link href="/contact" className="block hover:text-white">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white">Tracking</h3>

              <div className="mt-4 space-y-3 text-sm">
                <Link href="/track" className="block hover:text-white">
                  Track Shipment
                </Link>

                <Link href="/login" className="block hover:text-white">
                  Staff Portal
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white">ParcelPilot</h3>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Reliable operations. Customer visibility. Global movement.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-slate-800 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 ParcelPilot Logistics. All rights reserved.</p>

            <p>Every delivery. Right on track.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
