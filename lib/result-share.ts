export async function shareResult(
  title: string,
  text: string,
): Promise<void> {
  if (typeof navigator === "undefined") {
    return;
  }

  if (typeof navigator.share === "function") {
    await navigator.share({ title, text });
    return;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  }
}
