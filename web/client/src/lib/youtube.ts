/** Extract YouTube video ID from common URL shapes (first match). */
export function extractYoutubeVideoId(url: string): string | null {
  const u = url.trim();
  if (!u) {
    return null;
  }
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*\bv=)([\w-]{11})\b/,
    /youtu\.be\/([\w-]{11})\b/,
    /youtube\.com\/embed\/([\w-]{11})\b/,
    /youtube\.com\/shorts\/([\w-]{11})\b/,
    /youtube\.com\/live\/([\w-]{11})\b/,
  ];
  for (const p of patterns) {
    const m = u.match(p);
    if (m?.[1]) {
      return m[1];
    }
  }
  return null;
}

/** First YouTube video ID found across lines. */
export function firstYoutubeIdFromText(raw: string): string | null {
  for (const line of raw.split(/\r?\n/)) {
    const id = extractYoutubeVideoId(line.trim());
    if (id) {
      return id;
    }
  }
  return null;
}
