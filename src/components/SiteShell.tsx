import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function SiteShell({
  children,
  transparentHeader = true,
}: {
  children: ReactNode;
  transparentHeader?: boolean;
}) {
  return (
    <>
      <Header transparent={transparentHeader} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
