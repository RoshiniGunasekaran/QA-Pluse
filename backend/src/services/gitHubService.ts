import axios from "axios";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface Commit {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  files_changed: string[];
  risk_score: number;
}

export function calculateCommitRisk(files_changed: string[]): number {
  let riskScore = 0;

  for (const file of files_changed) {
    if (file.includes("src/services/")) {
      riskScore += 40;
    } else if (file.includes("src/pages/")) {
      riskScore += 30;
    } else if (file.includes("backend/src/")) {
      riskScore += 35;
    } else {
      riskScore += 10;
    }
  }

  return Math.min(riskScore, 100);
}

export async function fetchCommits(
  repoOwner: string,
  repoName: string
): Promise<Commit[]> {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is not configured");
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/commits`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
        params: {
          per_page: 20,
        },
      }
    );

    const commits: Commit[] = [];

    for (const commit of response.data) {
      const detailsResponse = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${commit.sha}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      const files_changed =
        detailsResponse.data.files?.map(
          (file: { filename: string }) => file.filename
        ) || [];

      commits.push({
        hash: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name || "Unknown",
        timestamp: commit.commit.author?.date || "",
        files_changed,
        risk_score: calculateCommitRisk(files_changed),
      });
    }

    return commits;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `GitHub API error: ${
          error.response?.data?.message || error.message
        }`
      );
    }

    throw new Error("Failed to fetch GitHub commits");
  }
}