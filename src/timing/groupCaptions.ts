import type { CaptionPhrase, WordTimestamp } from "../content/schema";

const SMALL = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "at",
  "by",
  "is",
  "are",
  "was",
  "be",
  "so",
  "if",
  "it",
  "you",
  "your",
  "just",
]);

function attachPunctuation(word: string): string {
  return word;
}

function shouldBreak(
  current: WordTimestamp[],
  next: WordTimestamp,
  maxWords: number,
): boolean {
  if (current.length === 0) return false;
  if (current.length >= maxWords) return true;

  const last = current[current.length - 1];
  if (/[.!?]$/.test(last.word)) return true;
  if (current.length >= 2 && /[,:;]$/.test(last.word) && current.length >= 3) {
    return true;
  }

  const gap = next.start - last.end;
  if (gap > 0.38 && current.length >= 2) return true;

  const nextBare = next.word.replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase();
  if (current.length >= 4 && !SMALL.has(nextBare)) return true;

  return false;
}

export function groupCaptions(
  words: WordTimestamp[],
  options?: { minWords?: number; maxWords?: number },
): CaptionPhrase[] {
  const minWords = options?.minWords ?? 2;
  const maxWords = options?.maxWords ?? 5;
  if (words.length === 0) return [];

  const phrases: CaptionPhrase[] = [];
  let bucket: WordTimestamp[] = [];

  const flush = () => {
    if (bucket.length === 0) return;
    phrases.push({
      text: bucket.map((w) => attachPunctuation(w.word)).join(" "),
      words: [...bucket],
      start: bucket[0].start,
      end: bucket[bucket.length - 1].end,
    });
    bucket = [];
  };

  for (const word of words) {
    if (shouldBreak(bucket, word, maxWords)) {
      if (bucket.length < minWords && phrases.length > 0) {
        const prev = phrases[phrases.length - 1];
        if (prev.words.length + bucket.length <= maxWords + 1) {
          prev.words.push(...bucket);
          prev.text = prev.words.map((w) => w.word).join(" ");
          prev.end = bucket[bucket.length - 1].end;
          bucket = [];
        } else {
          flush();
        }
      } else {
        flush();
      }
    }
    bucket.push(word);
  }
  flush();

  return phrases.filter((p) => p.text.trim().length > 0);
}
