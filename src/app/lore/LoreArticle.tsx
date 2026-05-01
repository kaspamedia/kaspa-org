import type { Contributor } from "./contributors";
import { LoreClosingSection } from "./sections/LoreClosingSection";
import { LoreFoundationsSection } from "./sections/LoreFoundationsSection";
import { LoreRoadmapSection } from "./sections/LoreRoadmapSection";

type LoreArticleProps = {
  contributors: Contributor[];
  totalContributors: number;
};

export default function LoreArticle({
  contributors,
  totalContributors,
}: LoreArticleProps): React.JSX.Element {
  return (
    <article className="mx-auto max-w-[700px] px-6 pt-28 pb-24 lg:pt-36">
      <h1 className="text-primary text-center text-[30px] leading-[1.2] font-normal tracking-[-0.02em] md:text-[34px]">
        Kaspa is a live proof-of-work blockDAG running at 10 blocks per second.
      </h1>

      <LoreFoundationsSection
        contributors={contributors}
        totalContributors={totalContributors}
      />
      <LoreRoadmapSection />
      <LoreClosingSection />
    </article>
  );
}
