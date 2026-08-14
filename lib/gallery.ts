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

type Manifest = {
  syncedAt: string | null;
  count: number;
  source: string;
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
