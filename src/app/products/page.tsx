import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SiteShell from "@/components/SiteShell";
import { CTABanner, CategoryCard, PartnerStrip } from "@/components/Sections";
import { SectionHeading } from "@/components/ui";
import { productCategories } from "@/data/site";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Ultrasound, X-ray, CT and MRI, mammography, laboratory analysers, patient monitoring and medical furniture — supplied, installed and serviced by Aziki Medical Systems Ltd.",
};

export default function ProductsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Products"
        title="Medical equipment for every department"
        body="We supply high-profile electro-medical diagnostic and imaging systems, laboratory instruments, monitoring equipment and medical furniture — always with installation, training and after-sales service included."
        image="/images/photos/cathlab.webp"
        breadcrumbs={[{ label: "Products", href: "/products" }]}
      />

      <section className="bg-white">
        <div className="container-page py-20 lg:py-24">
          <SectionHeading
            eyebrow="Catalogue"
            title="Seven equipment families"
            body="Every category is backed by our own engineers: siting advice before you buy, commissioning on delivery, and a maintenance contract afterwards."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productCategories.map((category, index) => (
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

      <PartnerStrip />
      <CTABanner
        title="Need a specification or a price?"
        body="Send us the department, the patient volume and the budget range — we will come back with options, not a catalogue dump."
      />
    </SiteShell>
  );
}
