import ExternalLink from "../components/ExternalLink";

const ARTICLE_LINK_CLASS_NAME = "text-[#1f5b91] underline underline-offset-2";

type LoreLinkProps = {
  children: React.ReactNode;
  href: string;
};

export function LoreLink({ children, href }: LoreLinkProps): React.JSX.Element {
  return (
    <ExternalLink href={href} className={ARTICLE_LINK_CLASS_NAME}>
      {children}
    </ExternalLink>
  );
}
