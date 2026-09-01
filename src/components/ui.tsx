import Link from "next/link";
import type { ReactNode } from "react";

export function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 ${className}`}
    >
      <path
        d="M3 10h13m0 0-5.2-5.2M16 10l-5.2 5.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "light";
  className?: string;
};

const buttonStyles = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_1px_0_rgba(0,0,0,0.04)]",
  outline:
    "border border-line bg-white text-ink hover:border-indigo-600 hover:text-indigo-600",
  light: "bg-white text-indigo-700 hover:bg-gold-400 hover:text-ink",
  ghost:
    "border border-white/35 text-white hover:border-white hover:bg-white/10 backdrop-blur-sm",
} as const;

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 ${buttonStyles[variant]} ${className}`}
    >
      {children}
      <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

export function ArrowLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800 ${className}`}
    >
      {children}
      <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`eyebrow ${className}`}>
      <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  tone = "dark",
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  action?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <div
      className={`reveal flex flex-col gap-5 ${
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? (
          <Eyebrow className={tone === "light" ? "!text-gold-400" : ""}>{eyebrow}</Eyebrow>
        ) : null}
        <h2
          className={`heading-lg mt-4 ${tone === "light" ? "text-white" : "text-ink"}`}
        >
          {title}
        </h2>
        {body ? (
          <p
            className={`mt-5 text-base leading-relaxed md:text-lg ${
              tone === "light" ? "text-white/70" : "text-ink-soft"
            }`}
          >
            {body}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
