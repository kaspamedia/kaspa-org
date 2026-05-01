import type { ReactNode } from "react";

export default function SectionHeading({
  label,
  title,
  description,
  className = "max-w-2xl",
  titleChildren,
}: {
  label: string;
  title: string;
  description: string;
  className?: string;
  titleChildren?: ReactNode;
}) {
  return (
    <div className={className}>
      <p className="text-muted text-[13px] font-medium tracking-[0.08em] uppercase">
        {label}
      </p>
      <h2 className="mt-3 text-[30px] leading-[1.02] font-medium tracking-[-0.03em] md:text-[38px]">
        {title}
      </h2>
      {titleChildren}
      <p className="text-tertiary mt-4 text-[16px] leading-[1.7] md:text-[17px]">
        {description}
      </p>
    </div>
  );
}
