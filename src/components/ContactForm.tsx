"use client";

import { useState } from "react";
import { company } from "@/data/site";
import { ArrowIcon } from "@/components/ui";

const enquiryTypes = [
  "Equipment quotation",
  "Hospital turnkey project",
  "Service, repair or maintenance",
  "Spare parts",
  "Training",
  "Trade-in or rental",
  "Other",
];

const fieldClass =
  "w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-soft/60 focus:border-indigo-600 focus:outline-none";

/**
 * No backend is wired up yet: the form composes a well-structured email and
 * hands it to the visitor's mail client, so the site can go live on static
 * hosting. Swap `handleSubmit` for a POST to an API route or a form service
 * (Formspree, Resend, etc.) when the client has a mailbox to receive it.
 */
export default function ContactForm() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    const subject = `${get("enquiry") || "Website enquiry"} — ${get("organisation") || get("name")}`;
    const body = [
      `Name: ${get("name")}`,
      `Organisation: ${get("organisation")}`,
      `Email: ${get("email")}`,
      `Phone: ${get("phone")}`,
      `Location: ${get("location")}`,
      `Enquiry type: ${get("enquiry")}`,
      "",
      get("message"),
    ].join("\n");

    window.location.href = `mailto:${company.emails[0]}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink">
            Full name <span className="text-gold-500">*</span>
          </label>
          <input id="name" name="name" required autoComplete="name" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="organisation" className="mb-2 block text-sm font-medium text-ink">
            Hospital / organisation
          </label>
          <input
            id="organisation"
            name="organisation"
            autoComplete="organization"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
            Email <span className="text-gold-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink">
            Phone
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="location" className="mb-2 block text-sm font-medium text-ink">
            State / city
          </label>
          <input id="location" name="location" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="enquiry" className="mb-2 block text-sm font-medium text-ink">
            Enquiry type
          </label>
          <select id="enquiry" name="enquiry" defaultValue={enquiryTypes[0]} className={fieldClass}>
            {enquiryTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-medium text-ink">
          How can we help? <span className="text-gold-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us about the equipment, facility or fault you have in mind."
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-5 pt-1">
        <button
          type="submit"
          className="group inline-flex items-center gap-2.5 rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-indigo-700"
        >
          Send enquiry
          <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        <p aria-live="polite" className="text-sm text-ink-soft">
          {sent
            ? "Your mail app should now be open with the enquiry ready to send."
            : `Or email us directly at ${company.emails[0]}`}
        </p>
      </div>
    </form>
  );
}
