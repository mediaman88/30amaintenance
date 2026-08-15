import manifest from "@/data/instagram.json";

export type Photo = {
  id: string;
  postId: string | null;
  src: string;
  width: number | null;
  height: number | null;
  caption: string;
  alt: string;
  tags: string[];
  permalink: string | null;
  timestamp: string;
  isVideo: boolean;
  albumIndex: number;
  albumSize: number;
};

/** One Instagram post: its photos, in the order they were posted. */
export type Album = {
  id: string;
  /** The Instagram caption, verbatim. */
  caption: string;
  /** Short heading derived from the caption — the first line or sentence. */
  title: string;
  /** Caption remainder once the title and hashtags are removed. May be "". */
  body: string;
  timestamp: string | null;
  tags: string[];
  photos: Photo[];
};

type ManifestAlbum = {
  id: string;
  caption: string;
  timestamp: string | null;
  tags: string[];
  count: number;
  cover: string;
};

type Manifest = {
  syncedAt: string | null;
  count: number;
  source: string;
  posts?: number;
  albums?: ManifestAlbum[];
  items: Photo[];
};

const data = manifest as unknown as Manifest;

/**
 * Hashtags that describe *the business* rather than *the job* — they make
 * noisy gallery filters, so they're hidden from the filter bar.
 */
const IGNORED_TAGS = new Set([
  "30a",
  "30amaintenance",
  "santarosabeach",
  "southwalton",
  "florida",
  "30aflorida",
  "contractor",
  "smallbusiness",
  "handyman",
]);

/**
 * Map hashtags people actually use to the service categories on the site, so
 * the gallery filters line up with the services list. Anything unmapped falls
 * through to "Other work".
 */
const TAG_TO_CATEGORY: Record<string, string> = {
  remodel: "Remodeling",
  remodeling: "Remodeling",
  renovation: "Remodeling",
  reno: "Remodeling",
  kitchen: "Remodeling",
  kitchenremodel: "Remodeling",
  bathroom: "Remodeling",
  bathroomremodel: "Remodeling",
  tile: "Remodeling",
  flooring: "Remodeling",
  backsplash: "Remodeling",
  cabinets: "Remodeling",

  paint: "Painting",
  painting: "Painting",
  drywall: "Painting",
  interiorpaint: "Painting",
  exteriorpaint: "Painting",

  deck: "Carpentry",
  decking: "Carpentry",
  carpentry: "Carpentry",
  trim: "Carpentry",
  pergola: "Carpentry",
  fence: "Carpentry",
  stairs: "Carpentry",

  maintenance: "Maintenance",
  repair: "Repairs",
  repairs: "Repairs",
  punchlist: "Repairs",
  rentalturnover: "Rental Turnovers",
  turnover: "Rental Turnovers",
  vacationrental: "Rental Turnovers",
  airbnb: "Rental Turnovers",
  pressurewashing: "Exterior",
  exterior: "Exterior",
  outdoorshower: "Exterior",
};

export function getPhotos(): Photo[] {
  return data.items ?? [];
}

export function hasPhotos(): boolean {
  return (data.items?.length ?? 0) > 0;
}

export function getSyncInfo() {
  return { syncedAt: data.syncedAt, source: data.source, count: data.count };
}

/** The newest N photos — used for the home page teaser. */
export function getFeaturedPhotos(count = 8): Photo[] {
  return getPhotos().slice(0, count);
}

export function categoryFor(photo: Photo): string | null {
  for (const tag of photo.tags) {
    const category = TAG_TO_CATEGORY[tag];
    if (category) return category;
  }
  return null;
}

/**
 * Build the filter list for the gallery. Only categories with a meaningful
 * number of photos are offered, so the bar doesn't fill with one-offs.
 */
export function getCategories(minCount = 2): string[] {
  const counts = new Map<string, number>();
  for (const photo of getPhotos()) {
    const category = categoryFor(photo);
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= minCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

/** Visible hashtags, minus the branding noise. */
export function visibleTags(photo: Photo): string[] {
  return photo.tags.filter((t) => !IGNORED_TAGS.has(t));
}

/** Caption trimmed for display, with hashtags moved out of the way. */
export function displayCaption(photo: Photo): string {
  return photo.caption
    .replace(/#[\wÀ-ɏ]+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Instagram captions here lean on strings of exclamation marks ("Porch
 * enclosure!!!!"). That reads as shouting on a business site, so runs of them
 * become a single full stop. Applied at display time only — the manifest keeps
 * the caption exactly as it was posted.
 */
function calmPunctuation(text: string): string {
  return (
    text
      // "Cabinets upgrade !!!!" → "Cabinets upgrade."
      .replace(/\s*!+/g, ".")
      // Don't leave "done.." behind where the text already ended in a stop.
      .replace(/\.{2,}/g, ".")
      // A stray space before the stop, from "word ." patterns.
      .replace(/\s+\./g, ".")
      .replace(/[ \t]{2,}/g, " ")
  );
}

/**
 * Split a caption into a heading and the rest. Instagram captions usually lead
 * with the gist and then run into detail, so the first line makes a good album
 * title.
 */
function splitCaption(caption: string): { title: string; body: string } {
  const clean = calmPunctuation(
    caption.replace(/#[\wÀ-ɏ]+/g, "").replace(/\n{3,}/g, "\n\n"),
  ).trim();

  if (!clean) return { title: "", body: "" };

  const MAX_TITLE = 140;
  const lines = clean.split("\n");
  const firstLine = lines[0].trim();
  const remainder = lines.slice(1).join("\n").trim();

  // Headings wrap, so length alone is no reason to shorten one. Nothing is
  // ever dropped: whatever doesn't belong in the heading moves into the body,
  // so the caption always reads in full.
  if (firstLine.length <= MAX_TITLE) {
    return { title: firstLine, body: remainder };
  }

  // Take whole sentences while they fit — one very short opener ("I know.")
  // makes a poor title on its own, so keep going until there's enough of it.
  const sentences = firstLine.split(/(?<=[.?])\s+/);
  let title = "";
  let taken = 0;
  for (const sentence of sentences) {
    const candidate = title ? `${title} ${sentence}` : sentence;
    if (candidate.length > MAX_TITLE && title) break;
    title = candidate;
    taken += sentence.length + 1;
    if (title.length > MAX_TITLE) break;
  }

  // A single run-on sentence longer than the limit. Break at a clause boundary
  // where there is one — cutting on a comma keeps phrases (and names like
  // "30A Maintenance") intact, where a bare word break would split them.
  if (title.length > MAX_TITLE) {
    const window = title.slice(0, MAX_TITLE);
    const clause = Math.max(
      window.lastIndexOf(", "),
      window.lastIndexOf("; "),
      window.lastIndexOf(": "),
    );
    const word = window.lastIndexOf(" ");
    const cut = clause > MAX_TITLE * 0.6 ? clause : word > 40 ? word : MAX_TITLE;
    taken = cut;
    title = title.slice(0, taken).replace(/[\s,;:]+$/, "");
  }

  const overflow = firstLine.slice(taken).trim();
  const body = [overflow, remainder].filter(Boolean).join("\n").trim();

  return { title, body };
}

/** Every post, newest first, with its photos in their original order. */
export function getAlbums(): Album[] {
  const manifestAlbums = data.albums ?? [];
  const photos = getPhotos();

  // Group photos by the post they came from.
  const byPost = new Map<string, Photo[]>();
  for (const photo of photos) {
    const key = photo.postId ?? "__ungrouped__";
    if (!byPost.has(key)) byPost.set(key, []);
    byPost.get(key)!.push(photo);
  }
  for (const list of byPost.values()) {
    list.sort((a, b) => a.albumIndex - b.albumIndex);
  }

  // Prefer the manifest's own album list — it preserves post order and the
  // post-level caption. Fall back to grouping alone for older manifests.
  const source: { id: string; caption: string; timestamp: string | null; tags: string[] }[] =
    manifestAlbums.length
      ? manifestAlbums
      : [...byPost.entries()].map(([id, list]) => ({
          id,
          caption: list[0]?.caption ?? "",
          timestamp: list[0]?.timestamp ?? null,
          tags: list[0]?.tags ?? [],
        }));

  return source
    .map((album) => {
      const { title, body } = splitCaption(album.caption ?? "");
      return {
        id: album.id,
        caption: album.caption ?? "",
        title,
        body,
        timestamp: album.timestamp,
        tags: album.tags ?? [],
        photos: byPost.get(album.id) ?? [],
      };
    })
    .filter((album) => album.photos.length > 0);
}

export function hasAlbums(): boolean {
  return (data.albums?.length ?? 0) > 0;
}

/** Category for a whole album, from its hashtags. */
export function categoryForAlbum(album: Album): string | null {
  for (const tag of album.tags) {
    const category = TAG_TO_CATEGORY[tag];
    if (category) return category;
  }
  return null;
}

/** Filter chips for the album view — only categories with enough albums. */
export function getAlbumCategories(minCount = 2): string[] {
  const counts = new Map<string, number>();
  for (const album of getAlbums()) {
    const category = categoryForAlbum(album);
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= minCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}
