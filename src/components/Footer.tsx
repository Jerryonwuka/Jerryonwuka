import Image from "next/image";
import Link from "next/link";
import { company, productCategories, services } from "@/data/site";

const footerColumns = [
  {
    title: "Products",
    links: productCategories.map((category) => ({
      label: category.name,
      href: `/products/${category.slug}`,
    })),
  },
  {
    title: "Solutions",
    links: services.map((service) => ({
      label: service.name,
      href: `/solutions/${service.slug}`,
    })),
  },
  {
    title: "Company",
    links: [
      { label: "About Aziki", href: "/about" },
      { label: "Leadership", href: "/about#leadership" },
      { label: "Certifications", href: "/about#certifications" },
      { label: "Projects", href: "/projects" },
      { label: "Service & support", href: "/support" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-indigo-900 text-white">
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Image
              src="/images/brand/aziki-logo-white.png"
              alt={company.name}
              width={400}
              height={207}
              className="h-11 w-auto"
            />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/65">
              {company.name} is a Nigerian healthcare solutions provider advancing medical
              technology to make healthcare more accessible across Africa.
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
              {company.strapline}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  {column.title}
                </p>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/75 transition-colors hover:text-gold-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-white/12 pt-10 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              Head office
            </p>
            <address className="mt-4 text-sm not-italic leading-relaxed text-white/75">
              {company.address.line1}
              <br />
              {company.address.line2}
              <br />
              {company.address.country}
            </address>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              Telephone
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {company.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-gold-400">
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">Email</p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {company.emails.map((email) => (
                <li key={email}>
                  <a href={`mailto:${email}`} className="hover:text-gold-400">
                    {email}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/50">{company.hours}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/12">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <p>{company.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
