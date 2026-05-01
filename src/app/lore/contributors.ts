export type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

export type ContributorSummary = {
  shown: Contributor[];
  total: number;
};

const SHOWN_CONTRIBUTORS = 14;
const CONTRIBUTORS_URL =
  "https://api.github.com/repos/kaspanet/rusty-kaspa/contributors?per_page=100";
const CONTRIBUTORS_REVALIDATE_SECONDS = 86_400;

export async function getContributors(): Promise<ContributorSummary> {
  try {
    const response = await fetch(CONTRIBUTORS_URL, {
      next: { revalidate: CONTRIBUTORS_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return { shown: [], total: 0 };
    }

    const data: Contributor[] = await response.json();
    return {
      shown: data.slice(0, SHOWN_CONTRIBUTORS),
      total: data.length,
    };
  } catch {
    return { shown: [], total: 0 };
  }
}
