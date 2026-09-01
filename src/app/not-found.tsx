import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <SiteShell transparentHeader={false}>
      <section className="container-page flex min-h-[70svh] flex-col justify-center py-32">
        <span className="eyebrow">
          <span aria-hidden="true" className="h-px w-7 bg-gold-400" />
          Error 404
        </span>
        <h1 className="heading-xl mt-5 max-w-2xl text-ink">
          We could not find that page
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
          The page may have moved, or the link may be out of date. Try our products, our solutions,
          or get in touch and we will point you in the right direction.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/">Back to home</Button>
          <Button href="/contact" variant="outline">
            Contact us
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
