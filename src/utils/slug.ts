const STOP = new Set(["a", "an", "the", "and", "or", "of", "to", "is", "in"]);

export function slugify(input: string, maxLength = 48): string {
  const words = input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));

  const slug = (words.length ? words : ["reel"]).join("-").slice(0, maxLength);
  return slug.replace(/-+$/g, "") || "reel";
}

export function datedId(idea: string, date = new Date()): string {
  const iso = date.toISOString().slice(0, 10);
  return `${iso}-${slugify(idea)}`;
}
