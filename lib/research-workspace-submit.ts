import { createResearchRequest } from "./research-request";

type ResearchFetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export async function submitResearchWorkspace(
  question: string,
  fetcher: ResearchFetcher = fetch,
) {
  const researchRequest = createResearchRequest(question);

  const response = await fetcher("/api/research", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(researchRequest),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Research failed.");
  }

  return data;
}

export function createResearchWorkspaceSubmitHandler(
  submit: (question: string) => Promise<unknown>,
  onResult: (result: unknown) => void,
) {
  return async (question: string) => {
    const result = await submit(question);
    onResult(result);
  };
}
