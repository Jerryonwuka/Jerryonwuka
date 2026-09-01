"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { company, navigation } from "@/data/site";
import { ArrowIcon } from "@/components/ui";

export default function Header({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const solid = scrolled || !transparent || openMenu !== null || mobileOpen;

  const openWithIntent = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };

  const closeWithIntent = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-white shadow-[0_1px_0_rgba(13,16,48,0.08)]" : "bg-transparent"
      }`}
      onMouseLeave={closeWithIntent}
    >
      {/* Utility bar */}
      <div
        className={`hidden border-b transition-colors duration-300 lg:block ${
          solid ? "border-line" : "border-white/15"
        }`}
      >
        <div className="container-page flex h-10 items-center justify-between text-xs">
          <p className={solid ? "text-ink-soft" : "text-white/75"}>
            {company.strapline}
          </p>
          <div className="flex items-center gap-6">
            <a
              href={`tel:${company.phones[0].replace(/\s/g, "")}`}
              className={`transition-colors ${
                solid ? "text-ink-soft hover:text-indigo-600" : "text-white/75 hover:text-white"
              }`}
            >
              {company.phones[0]}
            </a>
            <a
              href={`mailto:${company.emails[0]}`}
              className={`transition-colors ${
                solid ? "text-ink-soft hover:text-indigo-600" : "text-white/75 hover:text-white"
              }`}
            >
              {company.emails[0]}
            </a>
          </div>
        </div>
      </div>

      <div className="container-page flex h-18 items-center justify-between gap-6 lg:h-20">
        <Link href="/" className="flex items-center" aria-label={`${company.name} — home`}>
          <Image
            src={solid ? "/images/brand/aziki-logo.png" : "/images/brand/aziki-logo-white.png"}
            alt={company.name}
            width={400}
            height={207}
            priority
            className="h-9 w-auto lg:h-10"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navigation.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <div key={item.label} onMouseEnter={() => openWithIntent(item.label)}>
                <Link
                  href={item.href}
                  aria-expanded={item.columns ? openMenu === item.label : undefined}
                  onFocus={() => (item.columns ? openWithIntent(item.label) : setOpenMenu(null))}
                  className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                    solid
                      ? active || openMenu === item.label
                        ? "text-indigo-600"
                        : "text-ink hover:text-indigo-600"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.columns ? (
                    <svg
                      viewBox="0 0 12 12"
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 transition-transform duration-300 ${
                        openMenu === item.label ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M2 4.5 6 8.5 10 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                  <span
                    className={`absolute inset-x-3 bottom-0 h-0.5 origin-left bg-gold-400 transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className={`hidden rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 lg:inline-flex ${
              solid
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "border border-white/40 text-white hover:bg-white hover:text-indigo-700"
            }`}
          >
            Request a quote
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden ${
              solid || mobileOpen ? "text-ink hover:bg-mist" : "text-white hover:bg-white/10"
            }`}
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ${
                  mobileOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-opacity duration-200 ${
                  mobileOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ${
                  mobileOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Desktop mega menu */}
      {navigation.map((item) =>
        item.columns ? (
          <div
            key={`panel-${item.label}`}
            onMouseEnter={() => openWithIntent(item.label)}
            className={`absolute inset-x-0 top-full hidden border-t border-line bg-white transition-all duration-300 lg:block ${
              openMenu === item.label
                ? "pointer-events-auto visible translate-y-0 opacity-100"
                : "pointer-events-none invisible -translate-y-2 opacity-0"
            }`}
          >
            <div className="container-page grid grid-cols-12 gap-10 py-12">
              <div className="col-span-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  {item.label}
                </p>
                <Link
                  href={item.href}
                  className="group mt-4 inline-flex items-center gap-2 text-lg font-medium text-ink transition-colors hover:text-indigo-600"
                >
                  Overview
                  <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

              {item.columns.map((column) => (
                <div key={column.title} className="col-span-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                    {column.title}
                  </p>
                  <ul className="mt-4 space-y-1">
                    {column.items.map((child) => (
                      <li key={child.href + child.label}>
                        <Link
                          href={child.href}
                          className="-mx-3 block rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-mist hover:text-indigo-600"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {item.feature ? (
                <div className="col-span-3 rounded-2xl bg-indigo-900 p-7 text-white">
                  <p className="text-lg font-medium leading-snug">{item.feature.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{item.feature.body}</p>
                  <Link
                    href={item.feature.href}
                    className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold-400"
                  >
                    {item.feature.cta}
                    <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ) : null,
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-x-0 top-18 bottom-0 overflow-y-auto bg-white transition-all duration-300 lg:hidden ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="container-page py-6" aria-label="Mobile">
          <ul className="divide-y divide-line border-y border-line">
            {navigation.map((item) => (
              <li key={item.label}>
                {item.columns ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSection((value) => (value === item.label ? null : item.label))
                      }
                      aria-expanded={mobileSection === item.label}
                      className="flex w-full items-center justify-between py-4 text-left text-base font-medium text-ink"
                    >
                      {item.label}
                      <svg
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                        className={`h-3 w-3 text-ink-soft transition-transform duration-300 ${
                          mobileSection === item.label ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M2 4.5 6 8.5 10 4.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ${
                        mobileSection === item.label
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <ul className="space-y-1 pb-4 pl-1">
                          <li>
                            <Link
                              href={item.href}
                              className="block py-2 text-sm font-medium text-indigo-600"
                            >
                              {item.label} overview
                            </Link>
                          </li>
                          {item.columns.flatMap((column) =>
                            column.items.map((child) => (
                              <li key={`${column.title}-${child.href}-${child.label}`}>
                                <Link
                                  href={child.href}
                                  className="block py-2 text-sm text-ink-soft"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            )),
                          )}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href={item.href} className="block py-4 text-base font-medium text-ink">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <Link
            href="/contact"
            className="mt-8 flex w-full items-center justify-center rounded-full bg-indigo-600 px-6 py-3.5 text-sm font-medium text-white"
          >
            Request a quote
          </Link>

          <div className="mt-8 space-y-2 text-sm text-ink-soft">
            {company.phones.map((phone) => (
              <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className="block">
                {phone}
              </a>
            ))}
            <a href={`mailto:${company.emails[0]}`} className="block">
              {company.emails[0]}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
