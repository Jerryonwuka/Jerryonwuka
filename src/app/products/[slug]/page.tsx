import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import SiteShell from "@/components/SiteShell";
import { CTABanner, PartnerStrip } from "@/components/Sections";
import { ArrowIcon, Button, SectionHeading } from "@/components/ui";
import { productCategories } from "@/data/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return productCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = productCategories.find((item) => item.slug === slug);
  if (!category) return {};
  return { title: category.name, description: category.summary };
}

export default async function ProductCategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = productCategories.find((item) => item.slug === slug);
  if (!category) notFound();

  const others = productCategories.filter((item) => item.slug !== category.slug).slice(0, 3);

  return (
    <SiteShell>
      <PageHero
        eyebrow={category.tagline}
        title={category.name}
        body={category.summary}
        image={category.image}
        imagePosition={category.imagePosition}
        breadcrumbs={[
          { label: "Products", href: "/products" },
          { label: category.name, href: `/products/${category.slug}` },
        ]}
      >
        <Button href="/contact" variant="light">
          Request a quotation
        </Button>
      </PageHero>

      <section className="bg-white">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
          <div className="reveal lg:col-span-7">
            <span className="eyebrow">
              <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
              What we supply
            </span>
            <h2 className="heading-lg mt-4 text-ink">Range</h2>
            <ul className="mt-9 divide-y divide-line border-y border-line">
              {category.items.map((item) => (
                <li key={item} className="flex items-start gap-4 py-5">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                  <span className="text-base leading-relaxed text-ink-soft">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Typical applications
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {category.applications.map((application) => (
                  <span
                    key={application}
                    className="rounded-full border border-line bg-mist px-4 py-2 text-sm text-ink-soft"
                  >
                    {application}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="reveal lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className={`object-cover ${category.imagePosition}`}
              />
            </div>

            <div className="mt-8 rounded-2xl border border-line bg-mist p-8">
              <h3 className="text-lg font-medium text-ink">Included as standard</h3>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-ink-soft">
                <li>Pre-installation site survey and readiness report</li>
                <li>Installation, calibration and acceptance testing</li>
                <li>Applications training for your clinical team</li>
                <li>Warranty and an optional maintenance contract</li>
                <li>Spare parts and consumables supply</li>
              </ul>
              <div className="mt-7">
                <Link
                  href="/support"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-indigo-600"
                >
                  Service &amp; support
                  <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-mist">
        <div className="container-page py-20 lg:py-24">
          <SectionHeading eyebrow="Also available" title="Other equipment families" />
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/products/${other.slug}`}
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

      <PartnerStrip />
      <CTABanner />
    </SiteShell>
  );
}
