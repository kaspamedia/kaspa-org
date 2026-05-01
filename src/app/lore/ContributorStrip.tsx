import Image from "next/image";

import type { Contributor } from "./contributors";

type ContributorStripProps = {
  contributors: Contributor[];
  totalContributors: number;
};

export function ContributorStrip({
  contributors,
  totalContributors,
}: ContributorStripProps): React.JSX.Element | null {
  if (contributors.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <a
        href="https://github.com/kaspanet/rusty-kaspa/graphs/contributors"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex flex-wrap items-center gap-0"
      >
        <span className="sr-only">View Rusty Kaspa contributors on GitHub</span>
        {contributors.map((contributor) => (
          <Image
            key={contributor.login}
            src={contributor.avatar_url}
            alt=""
            width={36}
            height={36}
            className="-ml-1.5 rounded-full border-2 border-[var(--bg-primary)] transition-transform group-hover:scale-105 first:ml-0"
          />
        ))}
        {totalContributors > contributors.length ? (
          <span className="ml-2 text-[13px] font-medium text-[#1f5b91] underline underline-offset-2">
            +{totalContributors - contributors.length} contributors
          </span>
        ) : null}
      </a>
    </div>
  );
}
