import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import SiteShell from "@/components/SiteShell";
import { CTABanner } from "@/components/Sections";
import { ArrowIcon, Button, SectionHeading } from "@/components/ui";
import { services } from "@/data/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  return { title: service.name, description: service.summary };
}

export default async function SolutionPage({ params }: Params) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();

  const others = services.filter((item) => item.slug !== service.slug).slice(0, 3);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Solutions"
        title={service.name}
        body={service.summary}
        image="/images/photos/theatre-team.webp"
        breadcrumbs={[
          { label: "Solutions", href: "/solutions" },
          { label: service.name, href: `/solutions/${service.slug}` },
        ]}
      >
        <Button href="/contact" variant="light">
          Talk to our team
        </Button>
      </PageHero>

      <section className="bg-white">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
          <div className="reveal lg:col-span-7">
            <span className="eyebrow">
              <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
              Scope of work
            </span>
            <h2 className="heading-lg mt-4 text-ink">What is included</h2>
            <ol className="mt-9 space-y-px overflow-hidden rounded-2xl bg-line">
              {service.detail.map((item, index) => (
                <li key={item} className="flex items-start gap-5 bg-white p-6">
                  <span className="text-xs font-semibold tabular-nums text-gold-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base leading-relaxed text-ink-soft">{item}</span>
                </li>
              ))}
            </ol>

            {service.facilities.length ? (
              <div className="mt-12">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                  Facilities we deliver
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {service.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="rounded-full border border-line bg-mist px-4 py-2 text-sm text-ink-soft"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="reveal lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src="/images/photos/aziki-lobby.webp"
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-8 rounded-2xl bg-indigo-900 p-8 text-white">
              <h3 className="text-lg font-medium">Why Aziki</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Specialist medical electronics engineers with over 2,000 devices delivered, 150+
                hospitals equipped across 14 states, and 400+ medical staff trained. We answer the
                phone after the invoice is paid.
              </p>
              <Link
                href="/projects"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-gold-400"
              >
                See our track record
                <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-mist">
        <div className="container-page py-20 lg:py-24">
          <SectionHeading eyebrow="Related" title="Other solutions" />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/solutions/${other.slug}`}
                className="reveal group flex flex-col bg-white p-8 transition-colors duration-500 hover:bg-indigo-50"
              >
                <h3 className="text-lg font-medium text-ink transition-colors group-hover:text-indigo-600">
                  {other.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{other.summary}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
                  Learn more
                  <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </SiteShell>
  );
}
