export type PrintRoute = "research" | "study";

export function getPrintDocumentTitle(
  route: PrintRoute,
  question: string,
): string {
  const label = route === "research" ? "Research" : "Study";
  return `BILLBLI ${label} — ${question}`;
}

export function printResult(
  route: PrintRoute,
  question: string,
): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  document.title = getPrintDocumentTitle(route, question);
  window.print();
}
