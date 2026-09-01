import Image from "next/image";
import Link from "next/link";
import HomeHero from "@/components/HomeHero";
import SiteShell from "@/components/SiteShell";
import {
  CTABanner,
  CategoryCard,
  PartnerStrip,
  PillarRow,
  StatBand,
} from "@/components/Sections";
import { ArrowLink, Button, SectionHeading } from "@/components/ui";
import { company, productCategories, projects, services } from "@/data/site";

const featuredProducts = productCategories.slice(0, 6);
const featuredServices = services.slice(0, 4);

export default function HomePage() {
  return (
    <SiteShell>
      <HomeHero />

      {/* Intro */}
      <section className="bg-white">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
          <div className="reveal lg:col-span-7">
            <SectionHeading
              eyebrow={`Founded ${company.founded} · Abuja, Nigeria`}
              title="Advancing medical technology to make healthcare accessible across Africa"
              body="Aziki Medical Systems Ltd is a Nigerian healthcare solutions provider specialising in radiology and laboratory technology. We deliver customised, technology-driven solutions — ultrasound systems, CT and MRI units, X-ray, and laboratory equipment — through partnerships with world-renowned manufacturers, and we back every installation with our own engineers."
            />
            <div className="reveal mt-10 flex flex-wrap gap-4">
              <Button href="/about">About the company</Button>
              <Button href="/projects" variant="outline">
                Our track record
              </Button>
            </div>
          </div>

          <div className="reveal lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/photos/aziki-lobby.webp"
                alt="The Aziki Medical Systems head office reception in Abuja"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <StatBand />
      <PillarRow />

      {/* Products */}
      <section className="bg-mist">
        <div className="container-page py-20 lg:py-28">
          <SectionHeading
            eyebrow="Products"
            title="Equipment for every department"
            body="From a single probe to a fully fitted imaging centre — supplied, installed, calibrated and supported."
            action={<ArrowLink href="/products">View all products</ArrowLink>}
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((category, index) => (
              <CategoryCard
                key={category.slug}
                href={`/products/${category.slug}`}
                name={category.name}
                summary={category.summary}
                image={category.image}
                imagePosition={category.imagePosition}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="bg-white">
        <div className="container-page py-20 lg:py-28">
          <SectionHeading
            eyebrow="Solutions"
            title="Delivered as a project, not a purchase order"
            body="Equipment is the easy part. Aziki takes responsibility for the design, the install, the training and the years that follow."
            action={<ArrowLink href="/solutions">All solutions</ArrowLink>}
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {featuredServices.map((service, index) => (
              <Link
                key={service.slug}
                href={`/solutions/${service.slug}`}
                className="reveal group flex items-start gap-6 rounded-2xl border border-line p-8 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_24px_60px_-30px_rgba(47,50,147,0.4)] lg:p-10"
                style={{ "--reveal-delay": `${(index % 2) * 110}ms` } as React.CSSProperties}
              >
                <span className="mt-1 text-xs font-semibold tabular-nums text-gold-500">
                  0{index + 1}
                </span>
                <span>
                  <span className="block text-lg font-medium text-ink transition-colors group-hover:text-indigo-600">
                    {service.name}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-ink-soft">
                    {service.summary}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Track record */}
      <section className="bg-indigo-900">
        <div className="container-page py-20 lg:py-28">
          <SectionHeading
            tone="light"
            eyebrow="Track record"
            title="Executed nationwide"
            body="Teaching hospitals, federal medical centres, state governments and private clinics — across 14 states and counting."
            action={
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 text-sm font-medium text-gold-400"
              >
                All projects
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M3 10h13m0 0-5.2-5.2M16 10l-5.2 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            }
          />

          <ul className="mt-14 divide-y divide-white/12 border-y border-white/12">
            {projects.slice(0, 5).map((project) => (
              <li key={project.title} className="reveal">
                <Link
                  href="/projects"
                  className="group grid gap-3 py-7 transition-colors lg:grid-cols-12 lg:items-baseline lg:gap-8"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400 lg:col-span-2">
                    {project.category}
                  </span>
                  <span className="text-lg font-medium text-white transition-colors group-hover:text-gold-400 lg:col-span-6">
                    {project.title}
                  </span>
                  <span className="text-sm text-white/60 lg:col-span-4 lg:text-right">
                    {project.place}
                    {project.year ? ` · ${project.year}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PartnerStrip />

      {/* Chairman */}
      <section className="bg-white">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
          <div className="reveal lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/photos/clinician-goggles.webp"
                alt="A clinician at work in a hospital equipped by Aziki Medical"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="reveal flex flex-col justify-center lg:col-span-7">
            <span className="eyebrow">
              <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
              From the chairman
            </span>
            <blockquote className="mt-6">
              <p className="text-xl leading-relaxed text-ink md:text-2xl md:leading-relaxed">
                “We are not merely supplying technology — we are building resilient health systems
                and healthier futures.”
              </p>
            </blockquote>
            <p className="mt-8 text-sm leading-relaxed text-ink-soft">
              Since our establishment, Aziki Medical Systems Ltd has been steadfast in its purpose:
              democratising access to life-saving medical technology in Africa. Our pride lies in the
              hospitals we have equipped, the professionals we have trained, and the countless lives
              transformed through improved access to care.
            </p>
            <div className="mt-8">
              <p className="text-sm font-medium text-ink">Engr. Francis Adeyemi</p>
              <p className="text-sm text-ink-soft">Chairman, Aziki Group</p>
            </div>
            <div className="mt-8">
              <ArrowLink href="/about#chairman">Read the full message</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      <CTABanner />
    </SiteShell>
  );
}
