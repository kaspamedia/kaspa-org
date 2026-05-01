import type { AnchorHTMLAttributes, ReactNode } from "react";

type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export default function ExternalLink({
  href,
  children,
  target,
  rel,
  ...props
}: ExternalLinkProps) {
  const isExternal = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      target={target ?? (isExternal ? "_blank" : undefined)}
      rel={rel ?? (isExternal ? "noopener noreferrer" : undefined)}
      {...props}
    >
      {children}
    </a>
  );
}
