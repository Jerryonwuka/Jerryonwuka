"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowIcon } from "@/components/ui";

const slides = [
  {
    eyebrow: "Medical imaging",
    title: "The grandmasters of ultrasound systems",
    body: "Specialist medical electronics engineers since 1999 — supplying, installing and servicing diagnostic ultrasound across Nigeria and West Africa.",
    href: "/products/ultrasound",
    cta: "Explore ultrasound",
    image: "/images/photos/theatre-team.webp",
    position: "object-center",
  },
  {
    eyebrow: "Turnkey projects",
    title: "We design, build and equip entire hospitals",
    body: "From an empty site to a commissioned facility: equipment planning, civil works, installation, training and long-term service cover.",
    href: "/solutions/turnkey-projects",
    cta: "See our turnkey service",
    image: "/images/photos/cathlab.webp",
    position: "object-center",
  },
  {
    eyebrow: "Service & support",
    title: "After-sales engineering you can actually reach",
    body: "Preventive maintenance, board-level repair and spare parts for every brand of electro-medical equipment we distribute — and many we don't.",
    href: "/support",
    cta: "Request service",
    image: "/images/photos/clinician-goggles.webp",
    position: "object-[50%_25%]",
  },
];

const DURATION = 7000;

export default function HomeHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setIndex(((next % slides.length) + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setInterval(() => setIndex((value) => (value + 1) % slides.length), DURATION);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, index]);

  return (
    <section
      className="relative h-[88svh] min-h-[560px] w-full overflow-hidden bg-indigo-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Aziki Medical highlights"
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            slideIndex === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={slideIndex !== index}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={slideIndex === 0}
            sizes="100vw"
            className={`object-cover ${slide.position} ${
              slideIndex === index ? "scale-105" : "scale-100"
            } transition-transform duration-[9000ms] ease-linear`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/92 via-indigo-900/70 to-indigo-900/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-transparent to-indigo-900/40" />
        </div>
      ))}

      <div className="container-page relative flex h-full items-end pb-20 pt-32 lg:items-center lg:pb-28">
        <div className="max-w-2xl">
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.title}
              className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                slideIndex === index
                  ? "relative opacity-100 blur-0"
                  : "pointer-events-none absolute inset-x-0 translate-y-4 opacity-0 blur-[2px]"
              }`}
              aria-hidden={slideIndex !== index}
            >
              <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
                <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
                {slide.eyebrow}
              </span>
              <h1 className="heading-xl mt-5 text-white">{slide.title}</h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
                {slide.body}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href={slide.href}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-medium text-indigo-700 transition-colors duration-300 hover:bg-gold-400 hover:text-ink"
                >
                  {slide.cta}
                  <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-white/35 px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
                >
                  Talk to an engineer
                  <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide controls */}
      <div className="container-page absolute inset-x-0 bottom-8 hidden lg:block">
        <div className="flex items-center gap-5">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => go(slideIndex)}
              aria-label={`Show slide ${slideIndex + 1}: ${slide.title}`}
              aria-current={slideIndex === index}
              className="group relative h-1 w-16 overflow-hidden rounded-full bg-white/25"
            >
              <span
                className={`absolute inset-y-0 left-0 bg-gold-400 ${
                  slideIndex === index ? "w-full" : "w-0"
                } transition-[width] duration-700 group-hover:w-full`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs tabular-nums text-white/60">
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
