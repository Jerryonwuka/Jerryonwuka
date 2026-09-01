import type { Metadata } from "next";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import SiteShell from "@/components/SiteShell";
import { CTABanner, StatBand } from "@/components/Sections";
import { SectionHeading } from "@/components/ui";
import { certifications, company, leadership, partners } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Founded in 1999, Aziki Medical Systems Ltd is a Nigerian healthcare solutions provider advancing medical technology to make healthcare more accessible across Africa.",
};

function initials(name: string) {
  return name
    .replace(/^(Engr\.|Dr\.|Mr\.|Mrs\.|Architect|Prince)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow={`Founded ${company.founded}`}
        title="Advancing healthcare access across Africa"
        body="Aziki Medical Systems Ltd is a Nigerian-based provider of medical devices and solutions, dedicated to improving access to high-quality, innovative and reliable medical equipment across Africa."
        image="/images/photos/aziki-lobby.webp"
        breadcrumbs={[{ label: "About", href: "/about" }]}
      />

      <section className="bg-white">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
          <div className="reveal lg:col-span-7">
            <span className="eyebrow">
              <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
              Who we are
            </span>
            <h2 className="heading-lg mt-4 text-ink">
              Specialist medical electronics engineers
            </h2>
            <div className="mt-7 space-y-5 text-base leading-relaxed text-ink-soft">
              <p>
                Founded in {company.founded}, Aziki Medical Systems Ltd is a Nigerian-based
                healthcare solutions provider of medical devices and solutions, dedicated to
                improving access to high-quality, innovative and reliable medical equipment across
                Africa.
              </p>
              <p>
                We are firmly committed to our mission to advance medical technologies and make
                healthcare more accessible to all across Africa. Specialising in radiology and
                laboratory solutions, we deliver customised, technology-driven healthcare
                solutions — including ultrasound systems, CT and MRI units and laboratory
                equipment — through partnerships with world-renowned manufacturers.
              </p>
              <p>
                We are a reliable partner to both private and public healthcare facilities,
                underpinned by strategic partnerships with pioneers in medical technology and an
                unshakeable determination to transform Africa&apos;s health infrastructure.
              </p>
            </div>
          </div>

          <div className="reveal lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/photos/clinicians-tablet.webp"
                alt="Clinicians using equipment supplied by Aziki Medical Systems"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <StatBand />

      {/* Mission & vision */}
      <section id="mission" className="scroll-mt-28 bg-white">
        <div className="container-page py-20 lg:py-28">
          <SectionHeading eyebrow="Purpose" title="Mission &amp; vision" />
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-2">
            <div className="reveal bg-white p-9 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                Our mission
              </p>
              <p className="mt-6 text-lg leading-relaxed text-ink md:text-xl md:leading-relaxed">
                {company.mission}
              </p>
            </div>
            <div className="reveal bg-white p-9 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                Our vision
              </p>
              <p className="mt-6 text-lg leading-relaxed text-ink md:text-xl md:leading-relaxed">
                {company.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chairman */}
      <section id="chairman" className="scroll-mt-28 bg-indigo-900">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
          <div className="reveal lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/photos/clinician-goggles.webp"
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-7">
              <p className="text-base font-medium text-white">Engr. Francis Adeyemi</p>
              <p className="text-sm text-white/60">Chairman, Aziki Group</p>
            </div>
          </div>

          <div className="reveal lg:col-span-7">
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
              Message from the chairman
            </span>
            <h2 className="heading-lg mt-5 text-white">
              A legacy of trust, partnership and revolutionary impact
            </h2>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-white/70">
              <p>
                Since our establishment, Aziki Medical Systems Ltd has been steadfast in its
                purpose: democratising access to life-saving medical technology in Africa. What
                started as a vision to bridge global innovation with local healthcare has evolved
                into a legacy of trust, partnership and revolutionary impact.
              </p>
              <p>
                As Africa&apos;s healthcare needs evolve, so does our resolve. We are committed to
                advancing local capacity through innovation — combining state-of-the-art technology
                with localised expertise. Our pride lies in the hospitals we have equipped, the
                professionals we have trained, and the countless lives transformed through improved
                access to care.
              </p>
              <p>
                The journey ahead demands collaboration. Together with our partners, we are not
                merely supplying technology — we are building resilient health systems and healthier
                futures.
              </p>
              <p className="text-white">Join us in shaping a new era of African healthcare.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="scroll-mt-28 bg-white">
        <div className="container-page py-20 lg:py-28">
          <SectionHeading
            eyebrow="People"
            title="Leadership &amp; executive team"
            body="Engineers, clinicians, architects and accountants — the team behind every installation."
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-3">
            {leadership.map((person, index) => (
              <div
                key={person.name}
                className="reveal flex items-center gap-5 bg-white p-7"
                style={{ "--reveal-delay": `${(index % 3) * 80}ms` } as React.CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600"
                >
                  {initials(person.name)}
                </span>
                <span>
                  <span className="block text-base font-medium text-ink">{person.name}</span>
                  <span className="mt-1 block text-sm text-ink-soft">{person.role}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section id="partners" className="scroll-mt-28 bg-mist">
        <div className="container-page py-20 lg:py-24">
          <SectionHeading
            eyebrow="Partnerships"
            title="Brands we distribute"
            body="We represent world-renowned manufacturers in Nigeria, and our engineers are factory-trained on the systems we sell."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="reveal flex flex-col items-start gap-6 rounded-2xl border border-line bg-white p-9"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={220}
                  height={74}
                  className="h-9 w-auto"
                />
                <p className="text-sm text-ink-soft">{partner.note}</p>
              </div>
            ))}
            <div className="reveal flex flex-col justify-center rounded-2xl border border-dashed border-line bg-white p-9">
              <p className="text-sm leading-relaxed text-ink-soft">
                …and other world-renowned manufacturers across imaging, laboratory and life-support
                equipment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="scroll-mt-28 bg-white">
        <div className="container-page py-20 lg:py-24">
          <SectionHeading
            eyebrow="Credentials"
            title="Certifications"
            body="Factory technical training and authorisations held by our engineering team."
          />
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {certifications.map((certificate) => (
              <figure
                key={certificate.title}
                className="reveal overflow-hidden rounded-2xl border border-line"
              >
                <div className="relative aspect-[3/4] bg-mist">
                  <Image
                    src={certificate.image}
                    alt={certificate.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-contain"
                  />
                </div>
                <figcaption className="border-t border-line p-7">
                  <p className="text-base font-medium text-ink">{certificate.title}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{certificate.body}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </SiteShell>
  );
}
