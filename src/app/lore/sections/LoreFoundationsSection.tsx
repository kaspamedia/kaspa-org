import { LoreLink } from "../LoreLink";
import { ContributorStrip } from "../ContributorStrip";
import type { Contributor } from "../contributors";

type LoreFoundationsSectionProps = {
  contributors: Contributor[];
  totalContributors: number;
};

export function LoreFoundationsSection({
  contributors,
  totalContributors,
}: LoreFoundationsSectionProps): React.JSX.Element {
  return (
    <>
      <h2 className="text-primary mt-10 text-center text-[17px] font-bold">
        The shift
      </h2>
      <p className="text-secondary mt-3 text-[15px] leading-[1.72]">
        It takes a different route from older proof-of-work chains. Parallel
        blocks are not discarded. They are ordered. Many of the limits
        associated with proof of work came from older chain architecture, not
        from proof of work itself.{" "}
        <LoreLink href="https://eprint.iacr.org/2018/104.pdf">
          PHANTOM / GHOSTDAG paper
        </LoreLink>{" "}
      </p>

      <h2 className="text-primary mt-10 text-center text-[17px] font-bold">
        Brief history
      </h2>
      <p className="text-secondary mt-3 text-[15px] leading-[1.72]">
        Kaspa grew out of blockDAG research at the Hebrew University of
        Jerusalem and later Harvard. The research line dates back to the{" "}
        <LoreLink href="https://ethereum.org/en/whitepaper/#modified-ghost-implementation">
          GHOST protocol section of the Ethereum white paper
        </LoreLink>
        , surfaced early through the Bitcoin research circuit, and continued
        through SPECTRE and PHANTOM into the protocols running Kaspa today.{" "}
        <LoreLink href="https://youtu.be/8IlZ80mPWfE?si=metsyYxZ8pnBgRMf&t=1583">
          Scaling Bitcoin 2015
        </LoreLink>{" "}
        ·{" "}
        <LoreLink href="https://www.coindesk.com/markets/2017/10/25/spectre-creators-seek-vc-backing-for-blockchain-free-cryptocurrency">
          CoinDesk, 2017
        </LoreLink>
      </p>
      <p className="text-secondary mt-3 text-[15px] leading-[1.72]">
        Mainnet launched in November 2021 as a fair-launched proof-of-work
        network. No premine, insider allocation, or pre-sales. Every coin in
        circulation has been mined in the open from genesis onward. That fair
        launch gave Kaspa a broad and loyal community. That remains one of its
        strongest achievements and one of its core strengths.{" "}
        <LoreLink href="https://hashdag.medium.com/kaspa-launch-plan-responding-to-reality-6b4bec449037">
          Launch plan
        </LoreLink>{" "}
        ·{" "}
        <LoreLink href="https://github.com/kaspagang/kaspad-py-explorer/blob/main/src/genesis_proof.ipynb">
          Genesis proof
        </LoreLink>
      </p>

      <h2 className="text-primary mt-10 text-center text-[17px] font-bold">
        North star
      </h2>
      <p className="text-secondary mt-3 text-[15px] leading-[1.72]">
        Real-time decentralization is Kaspa&apos;s north star.
      </p>
      <p className="text-secondary mt-3 text-[15px] leading-[1.72]">
        Real-time is a non-compromise. Impatience is Kaspa&apos;s primitive
        instinct - a tantrum against wait times, rejecting limits the adults
        just accept. And we demand this not only for speed but for the hardcore
        Satoshi properties as well - censorship resistance, permissionless
        settlement, competitive mining - all achieved in real time, not
        eventually. This is not achievable in real time without proof of work.{" "}
        <LoreLink href="https://x.com/michaelsuttonil/status/1973887808776675365">
          PoW uniqueness
        </LoreLink>
      </p>
      <p className="text-secondary mt-3 text-[15px] leading-[1.72]">
        Kaspa achieving RTD means the protocol samples the honest majority of
        the mining network in every consensus round. This allows transactions
        that confirm safely after an hour in Bitcoin to confirm in seconds on
        Kaspa; or it guarantees that Kaspa achieves censorship resistance within
        seconds - what takes an hour in Bitcoin. This matters not only for
        settlement speed but for every context where real-time sequencing is
        critical - market resolutions, liquidation cascades, anywhere a single
        consensus leader ordering transactions at its own discretion grants them
        too much power.
      </p>
      <p className="text-secondary mt-3 text-[15px] leading-[1.72]">
        Real-time sampling of the honest majority can also be utilized to
        achieve a trustless real-time data and event feed governed by the mining
        network.{" "}
        <LoreLink href="https://hashdag.medium.com/in-which-it-was-never-my-choice-to-hold-the-fire-we-found-937314149402">
          RTD post
        </LoreLink>
      </p>
      <p className="text-secondary mt-3 text-[15px] leading-[1.72]">
        RTD has also a defensive side. Partial synchrony (with the upcoming
        DAGKnight) protocols uniquely implement the dual property of being fast
        when the network is healthy and slow-yet-secure when it is not. Kaspa
        sells speed to normies and wargrade money to cypherpunks.
      </p>

      <hr className="border-subtle my-10 border-t" />

      <h2 className="text-primary text-center text-[17px] font-bold">
        Shipped and next
      </h2>
      <p className="text-secondary mt-3 text-[15px] leading-[1.72]">
        The original Golang node was rewritten from scratch in Rust. The rewrite
        was backed by a 100M KAS community grant and turned into a real
        open-source effort around <em>rusty-kaspa</em>, with a broad contributor
        base.{" "}
        <LoreLink href="https://github.com/kaspanet/rusty-kaspa">
          Rusty Kaspa GitHub
        </LoreLink>{" "}
      </p>
      <p className="text-secondary mt-3 text-[15px] leading-[1.72]">
        That rewrite is what made Crescendo possible. Kaspa could not move to 10
        blocks per second on mainnet without it. Crescendo is where the thesis
        became live.{" "}
        <LoreLink href="https://medium.com/@michaelsuttonil/unveiling-the-crescendo-hard-fork-roadmap-10bps-and-more-6072329e177f">
          Crescendo reference
        </LoreLink>{" "}
        ·{" "}
        <LoreLink href="https://github.com/kaspanet/rusty-kaspa/releases/tag/v1.0.0">
          Release notes
        </LoreLink>
      </p>

      <ContributorStrip
        contributors={contributors}
        totalContributors={totalContributors}
      />
    </>
  );
}
