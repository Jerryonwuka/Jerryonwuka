import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SiteShell from "@/components/SiteShell";
import { CTABanner, StatBand } from "@/components/Sections";
import { ArrowIcon, SectionHeading } from "@/components/ui";
import { services } from "@/data/site";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Hospital turnkey projects, installation and commissioning, maintenance and repairs, spare parts, training, consultancy, trade-in and rentals from Aziki Medical Systems Ltd.",
};

const turnkey = services[0];

export default function SolutionsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Solutions"
        title="More than a distributor — a complete healthcare solutions provider"
        body="We build, we equip, we install, we maintain and we train. Seven services that take a healthcare facility from a drawing to a working department, and keep it working."
        image="/images/photos/clinicians-tablet.webp"
        breadcrumbs={[{ label: "Solutions", href: "/solutions" }]}
      />

      <section className="bg-white">
        <div className="container-page py-20 lg:py-24">
          <SectionHeading
            eyebrow="What we do"
            title="Seven ways we work with healthcare facilities"
            body="Take one, or take the lot. Most of our clients start with a single system and end up handing us the whole department."
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Link
                key={service.slug}
                href={`/solutions/${service.slug}`}
                className="reveal group flex flex-col bg-white p-8 transition-colors duration-500 hover:bg-indigo-50 lg:p-10"
                style={{ "--reveal-delay": `${(index % 3) * 90}ms` } as React.CSSProperties}
              >
                <span className="text-xs font-semibold tabular-nums text-gold-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="heading-md mt-5 text-ink transition-colors group-hover:text-indigo-600">
                  {service.name}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">
                  {service.summary}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
                  Learn more
                  <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}

            {/* Fills the trailing cells so the divider grid never shows a gap */}
            <Link
              href="/contact"
              className="reveal group flex flex-col justify-center bg-white p-8 transition-colors duration-500 hover:bg-indigo-50 md:col-span-1 lg:col-span-2 lg:p-10"
            >
              <h3 className="heading-md text-ink transition-colors group-hover:text-indigo-600">
                Not sure where to start?
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
                Describe the department, the patient volume and the budget. Our engineers will scope
                it and come back with options.
              </p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
                Talk to our engineers
                <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-mist">
        <div className="container-page py-20 lg:py-24">
          <SectionHeading
            eyebrow="Turnkey"
            title="Facilities we build and equip"
            body="Our turnkey teams have delivered every scale of facility, from a single-room primary healthcare centre to a 300-bed general hospital."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {turnkey.facilities.map((facility, index) => (
              <div
                key={facility}
                className="reveal rounded-xl border border-line bg-white p-6 text-sm font-medium text-ink"
                style={{ "--reveal-delay": `${(index % 4) * 70}ms` } as React.CSSProperties}
              >
                {facility}
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatBand tone="dark" />
      <CTABanner />
    </SiteShell>
  );
}
