import Image from "next/image";
import Link from "next/link";
import { company, partners, stats } from "@/data/site";
import { ArrowIcon, Button, SectionHeading } from "@/components/ui";

export function StatBand({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <section className={dark ? "bg-indigo-900" : "bg-mist"}>
      <div className="container-page py-14 lg:py-16">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {stats.map((stat, statIndex) => (
            <div
              key={stat.label}
              className="reveal"
              style={{ "--reveal-delay": `${statIndex * 90}ms` } as React.CSSProperties}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span
                  className={`block text-4xl font-semibold tracking-tight lg:text-5xl ${
                    dark ? "text-white" : "text-indigo-600"
                  }`}
                >
                  {stat.value}
                </span>
                <span
                  className={`mt-3 block text-sm ${dark ? "text-white/60" : "text-ink-soft"}`}
                >
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function PartnerStrip() {
  return (
    <section className="border-y border-line bg-white">
      <div className="container-page py-12">
        <div className="reveal flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
            Brands we distribute
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
            {partners.map((partner) => (
              <Image
                key={partner.name}
                src={partner.logo}
                alt={partner.name}
                width={220}
                height={74}
                className="h-8 w-auto opacity-70 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
              />
            ))}
            <span className="text-sm text-ink-soft">
              and other world-renowned manufacturers
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTABanner({
  title = "Planning a facility, an upgrade or a repair?",
  body = "Tell us what you are building and our engineers will come back with a specification, a budget and a delivery timeline.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-indigo-900">
      <Image
        src="/images/photos/clinicians-tablet.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-900/90 to-indigo-800/70" />
      <div className="container-page relative py-20 lg:py-24">
        <div className="reveal grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
              Get in touch
            </span>
            <h2 className="heading-lg mt-5 text-white">{title}</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">{body}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 lg:col-span-5 lg:justify-end">
            <Button href="/contact" variant="light">
              Request a quote
            </Button>
            <a
              href={`tel:${company.phones[0].replace(/\s/g, "")}`}
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/35 px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
            >
              {company.phones[0]}
              <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoryCard({
  href,
  name,
  summary,
  image,
  imagePosition = "object-center",
  index = 0,
}: {
  href: string;
  name: string;
  summary: string;
  image: string;
  imagePosition?: string;
  index?: number;
}) {
  return (
    <Link
      href={href}
      className="reveal group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-500 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_24px_60px_-24px_rgba(47,50,147,0.35)]"
      style={{ "--reveal-delay": `${(index % 3) * 90}ms` } as React.CSSProperties}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover ${imagePosition} transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col p-7">
        <h3 className="text-lg font-medium text-ink transition-colors group-hover:text-indigo-600">
          {name}
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{summary}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
          Learn more
          <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function PillarRow() {
  const pillars = [
    {
      title: "We build",
      body: "End-to-end turnkey solutions for private and general hospitals, primary and secondary healthcare centres, diagnostic and imaging centres, nuclear medicine, oncology and dialysis facilities.",
      href: "/solutions/turnkey-projects",
    },
    {
      title: "We equip",
      body: "CT, MRI, X-ray, mammography, ultrasound, ECG, haematology and blood analysers, laboratory instruments and medical furniture — supplied and commissioned as one package.",
      href: "/products",
    },
    {
      title: "We install, maintain and train",
      body: "Specialist medical electronics engineers providing after-sales service for every brand we distribute, plus hands-on training for clinicians, nurses and biomedical engineers.",
      href: "/support",
    },
  ];

  return (
    <section className="bg-white">
      <div className="container-page py-20 lg:py-28">
        <SectionHeading
          eyebrow="More than a distributor"
          title="A complete healthcare solutions provider"
          body="Most suppliers stop at delivery. We stay for the installation, the training, the maintenance contract and the next upgrade."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
          {pillars.map((pillar, pillarIndex) => (
            <Link
              key={pillar.title}
              href={pillar.href}
              className="reveal group flex flex-col bg-white p-8 transition-colors duration-500 hover:bg-mist lg:p-10"
              style={{ "--reveal-delay": `${pillarIndex * 110}ms` } as React.CSSProperties}
            >
              <span className="text-xs font-semibold tabular-nums text-gold-500">
                0{pillarIndex + 1}
              </span>
              <h3 className="heading-md mt-5 text-ink">{pillar.title}</h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">{pillar.body}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
                Learn more
                <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
