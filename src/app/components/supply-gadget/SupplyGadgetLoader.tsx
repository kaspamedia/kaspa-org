"use client";

import dynamic from "next/dynamic";

const SupplyGadget = dynamic(() => import("./SupplyGadget"), { ssr: false });

export default function SupplyGadgetLoader({
  showIntro,
}: {
  showIntro?: boolean;
}) {
  return <SupplyGadget showIntro={showIntro} />;
}
