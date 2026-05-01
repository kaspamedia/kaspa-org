import type { ReactNode } from "react";

import Footer from "./Footer";
import Nav from "./Nav";

export default function MarketingPageShell({
  children,
  afterFooter,
}: {
  children: ReactNode;
  afterFooter?: ReactNode;
}) {
  return (
    <div className="relative">
      <Nav />
      <main className="relative z-10">{children}</main>
      <Footer />
      {afterFooter}
    </div>
  );
}
