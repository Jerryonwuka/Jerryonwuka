import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SiteShell from "@/components/SiteShell";
import { CTABanner, PartnerStrip, StatBand } from "@/components/Sections";
import { SectionHeading } from "@/components/ui";
import { projects } from "@/data/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Executed projects nationwide: teaching hospitals, federal medical centres, state governments and private facilities equipped by Aziki Medical Systems Ltd across 14+ Nigerian states.",
};

export default function ProjectsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Track record"
        title="Executed projects nationwide"
        body="Over 2,000 medical devices delivered and 150+ hospitals equipped across 14 states — from single ultrasound installations to a 300-bed general hospital."
        image="/images/photos/theatre-team.webp"
        breadcrumbs={[{ label: "Projects", href: "/projects" }]}
      />

      <StatBand />

      <section className="bg-white">
        <div className="container-page py-20 lg:py-24">
          <SectionHeading
            eyebrow="Selected work"
            title="A decade and more of installations"
            body="A sample of the hospitals, teaching hospitals and government facilities we have supplied, installed and serviced."
          />

          <ul className="mt-14 divide-y divide-line border-y border-line">
            {projects.map((project, index) => (
              <li
                key={project.title}
                className="reveal grid gap-4 py-8 lg:grid-cols-12 lg:gap-8"
                style={{ "--reveal-delay": `${(index % 4) * 70}ms` } as React.CSSProperties}
              >
                <div className="lg:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                    {project.category}
                  </span>
                </div>
                <div className="lg:col-span-7">
                  <h3 className="text-lg font-medium text-ink">{project.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">{project.scope}</p>
                </div>
                <div className="text-sm text-ink-soft lg:col-span-3 lg:text-right">
                  {project.place}
                  {project.year ? (
                    <span className="block text-ink-soft/70">{project.year}</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PartnerStrip />
      <CTABanner
        title="Your facility could be next"
        body="Tell us what you are planning — a new department, a replacement scanner, or a full hospital build — and we will scope it with you."
      />
    </SiteShell>
  );
}
