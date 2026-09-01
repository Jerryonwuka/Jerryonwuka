import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import SiteShell from "@/components/SiteShell";
import { CTABanner } from "@/components/Sections";
import { ArrowIcon, Button, SectionHeading } from "@/components/ui";
import { company } from "@/data/site";

export const metadata: Metadata = {
  title: "Service & Support",
  description:
    "Preventive maintenance, repairs, spare parts and hands-on training for medical imaging, laboratory and theatre equipment — from Aziki Medical Systems' in-house engineers in Abuja.",
};

const supportOptions = [
  {
    title: "Report a fault",
    body: "Call the service desk with your equipment make, model and serial number. We triage on the phone and dispatch an engineer where a site visit is needed.",
    action: { label: company.phones[0], href: `tel:${company.phones[0].replace(/\s/g, "")}` },
  },
  {
    title: "Book preventive maintenance",
    body: "Scheduled visits keep imaging and laboratory equipment inside specification and give you the documented service history accreditation bodies ask for.",
    action: { label: "Request a contract", href: "/contact" },
  },
  {
    title: "Order spare parts",
    body: "Transducers, X-ray tubes, boards, power supplies, analyser modules and consumables — sourced through our manufacturer partnerships.",
    action: { label: "Enquire about parts", href: "/solutions/spare-parts" },
  },
  {
    title: "Arrange training",
    body: "Applications training for clinicians and nurses, first-line maintenance courses for biomedical engineers — at your facility or at our Abuja centre.",
    action: { label: "Training programmes", href: "/solutions/training" },
  },
];

const coverage = [
  "Ultrasound systems and transducers",
  "X-ray, fluoroscopy and C-arm systems",
  "CT and MRI units",
  "Mammography units",
  "Haematology, chemistry and blood analysers",
  "ECG, patient monitors and defibrillators",
  "Ventilators and anaesthesia machines",
  "Sterilisers, theatre lights and tables",
];

export default function SupportPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Service &amp; support"
        title="After-sales engineering you can actually reach"
        body="We are first and foremost specialist medical electronics engineers. We service every brand of equipment we distribute — and many that we don't."
        image="/images/photos/echo-ultrasound.webp"
        breadcrumbs={[{ label: "Support", href: "/support" }]}
      >
        <Button href="/contact" variant="light">
          Request service
        </Button>
      </PageHero>

      <section className="bg-white">
        <div className="container-page py-20 lg:py-24">
          <SectionHeading
            eyebrow="How to reach us"
            title="Four ways we support your facility"
            body="Downtime on a scanner is downtime for a whole department. Our service desk is staffed during business hours and our engineers travel nationwide."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {supportOptions.map((option, index) => (
              <div
                key={option.title}
                className="reveal flex flex-col rounded-2xl border border-line p-8 transition-all duration-500 hover:border-indigo-200 hover:shadow-[0_24px_60px_-30px_rgba(47,50,147,0.35)] lg:p-10"
                style={{ "--reveal-delay": `${(index % 2) * 110}ms` } as React.CSSProperties}
              >
                <h3 className="heading-md text-ink">{option.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">{option.body}</p>
                <Link
                  href={option.action.href}
                  className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-indigo-600"
                >
                  {option.action.label}
                  <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist">
        <div className="container-page grid gap-14 py-20 lg:grid-cols-12 lg:gap-20 lg:py-24">
          <div className="reveal lg:col-span-6">
            <span className="eyebrow">
              <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
              Coverage
            </span>
            <h2 className="heading-lg mt-4 text-ink">Equipment we service</h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Our workshop handles board-level electronics repair, and our field engineers carry the
              test equipment to diagnose on site. If it is electro-medical, bring it to us.
            </p>
            <ul className="mt-9 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {coverage.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal lg:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/photos/cathlab.webp"
                alt="An imaging suite serviced by Aziki Medical engineers"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-8 rounded-2xl border border-line bg-white p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Service desk
              </p>
              <div className="mt-5 space-y-2">
                {company.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="block text-lg font-medium text-ink transition-colors hover:text-indigo-600"
                  >
                    {phone}
                  </a>
                ))}
              </div>
              <a
                href={`mailto:${company.emails[0]}`}
                className="mt-4 block text-sm text-indigo-600 hover:text-indigo-800"
              >
                {company.emails[0]}
              </a>
              <p className="mt-4 text-sm text-ink-soft">{company.hours}</p>
            </div>
          </div>
        </div>
      </section>

      <CTABanner
        title="Equipment down, or due a service?"
        body="Send us the make, model and fault description and we will come back with a diagnosis, a parts list and a visit date."
      />
    </SiteShell>
  );
}
