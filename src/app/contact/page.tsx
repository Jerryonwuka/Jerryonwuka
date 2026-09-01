import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PageHero from "@/components/PageHero";
import SiteShell from "@/components/SiteShell";
import { PartnerStrip } from "@/components/Sections";
import { company } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Aziki Medical Systems Ltd in Abuja for medical equipment quotations, hospital turnkey projects, service, spare parts and training.",
};

const mapQuery = encodeURIComponent(
  `${company.address.line1}, ${company.address.line2}, ${company.address.country}`,
);

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Talk to our engineers"
        body="Quotations, turnkey projects, service calls, spare parts and training — tell us what you need and the right person will come back to you."
        image="/images/photos/aziki-lobby.webp"
        breadcrumbs={[{ label: "Contact", href: "/contact" }]}
      />

      <section className="bg-white">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
          <div className="reveal lg:col-span-7">
            <h2 className="heading-md text-ink">Send us an enquiry</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              The more detail you give us — department, patient volume, existing equipment — the
              more useful our first reply will be.
            </p>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          <aside className="reveal lg:col-span-5">
            <div className="rounded-2xl bg-indigo-900 p-9 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
                Head office
              </p>
              <address className="mt-5 text-base not-italic leading-relaxed text-white/80">
                {company.address.line1}
                <br />
                {company.address.line2}
                <br />
                {company.address.country}
              </address>

              <div className="mt-8 border-t border-white/12 pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  Telephone
                </p>
                <ul className="mt-4 space-y-2">
                  {company.phones.map((phone) => (
                    <li key={phone}>
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="text-base text-white/85 transition-colors hover:text-gold-400"
                      >
                        {phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-white/12 pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  Email
                </p>
                <ul className="mt-4 space-y-2">
                  {company.emails.map((email) => (
                    <li key={email}>
                      <a
                        href={`mailto:${email}`}
                        className="text-base text-white/85 transition-colors hover:text-gold-400"
                      >
                        {email}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-white/12 pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  Office hours
                </p>
                <p className="mt-4 text-base text-white/85">{company.hours}</p>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-line">
              <iframe
                title={`Map to ${company.name}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-80 w-full border-0"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
                className="block border-t border-line px-6 py-4 text-sm font-medium text-indigo-600 transition-colors hover:bg-mist"
              >
                Open in Google Maps
              </a>
            </div>
          </aside>
        </div>
      </section>

      <PartnerStrip />
    </SiteShell>
  );
}
