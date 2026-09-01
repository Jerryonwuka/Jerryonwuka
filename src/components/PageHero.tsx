import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function PageHero({
  eyebrow,
  title,
  body,
  image = "/images/photos/theatre-team.webp",
  imagePosition = "object-center",
  breadcrumbs = [],
  children,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  image?: string;
  imagePosition?: string;
  breadcrumbs?: { label: string; href: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-indigo-900 pt-32 pb-16 lg:pt-44 lg:pb-24">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className={`object-cover ${imagePosition} opacity-35`}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-900/85 to-indigo-900/45" />

      <div className="container-page relative">
        {breadcrumbs.length ? (
          <nav aria-label="Breadcrumb" className="mb-7">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-white/55">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb, crumbIndex) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  <span aria-hidden="true">/</span>
                  {crumbIndex === breadcrumbs.length - 1 ? (
                    <span className="text-white/85">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="transition-colors hover:text-white">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="max-w-3xl">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
              {eyebrow}
            </span>
          ) : null}
          <h1 className="heading-xl mt-5 text-white">{title}</h1>
          {body ? (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              {body}
            </p>
          ) : null}
          {children ? <div className="mt-9">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
