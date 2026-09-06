import type { ResultRoute } from "./result-actions";

type ShareFunction = (title: string, text: string) => Promise<void>;

export function createShareHandler(
  route: ResultRoute,
  question: string,
  text: string,
  share: ShareFunction,
): () => Promise<void> {
  const title = route === "research" ? "BILLBLI Research" : "BILLBLI Study";
  const shareText = text.startsWith(question)
    ? text
    : `${question}\n\n${text}`;

  return () => share(title, shareText);
}
