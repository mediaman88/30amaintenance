/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT THIS FILE FIRST.
 *  Everything the site displays about your business lives here.
 *  Anything marked TODO is a placeholder — replace it before launch.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: "30A Maintenance & Remodeling",
  // Short form for tight spots like the header logo.
  shortName: "30A Maintenance",
  legalName: "30A Maintenance & Remodeling LLC",
  tagline: "Remodeling & Property Maintenance on Scenic 30A",
  description:
    "Remodeling, repairs, and year-round property maintenance for homes and vacation rentals along Scenic Highway 30A and South Walton, Florida.",

  /**
   * The real logo file. Save the logo into `public/` and put its path here,
   * e.g. "/logo.png". Leave "" and components/Logo.tsx draws a stand-in built
   * from the same navy ring / gold disc / "30A" lockup.
   * A square PNG with a transparent background at 512×512 or larger is ideal.
   */
  logoSrc: "",

  // Used for canonical URLs, sitemap, and Open Graph tags.
  // Set NEXT_PUBLIC_SITE_URL in Vercel to your real domain and this follows it.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://30amaintenance.com", // TODO: confirm domain

  contact: {
    phone: "(850) 960-2594",
    phoneHref: "tel:+18509602594",
    email: "30a.maintenance@gmail.com",
    // Where the contact form sends to. Falls back to contact.email.
    formRecipient: "30a.maintenance@gmail.com",
  },

  social: {
    instagram: "https://www.instagram.com/30a.maintenance/",
    instagramHandle: "@30a.maintenance",
    facebook: "", // optional — leave "" to hide
  },

  // Matches the Google Business Profile listing. Keep name, address and phone
  // identical across the site, Google, and Instagram — search engines treat
  // mismatches as different businesses and it costs you local ranking.
  location: {
    street: "19228 US-331",
    city: "Freeport",
    region: "FL",
    regionName: "Florida",
    postalCode: "32439",
    country: "US",
    // Approximate — fine for schema. For an exact pin, grab the coordinates
    // from the Google Maps URL for the business.
    latitude: 30.4972,
    longitude: -86.1344,
    serviceRadiusMiles: 30,
  },

  // Google Business Profile rating. Update as reviews come in.
  // Set show: false to hide the badge entirely.
  googleRating: {
    show: true,
    rating: 5.0,
    count: 2,
    // TODO: paste the "write a review" / profile link from your Google listing
    url: "",
  },

  areasServed: [
    "Santa Rosa Beach",
    "Seaside",
    "Grayton Beach",
    "WaterColor",
    "Seagrove Beach",
    "Alys Beach",
    "Rosemary Beach",
    "Inlet Beach",
    "Blue Mountain Beach",
    "Dune Allen",
    "Watersound",
    "Miramar Beach",
    "Freeport",
  ],

  hours: {
    weekdays: "Mon–Fri, 8:00am – 5:00pm",
    saturday: "Sat, 8:00am – 5:00pm",
    sunday: "Sun, closed",
    // Shown in the "urgent" callout. Set to "" to hide that callout.
    emergencyNote: "Rental turnover emergency? Call and we'll work you in.",
  },

  // TODO: add your Florida license number if you hold one (CBC/CRC/CGC).
  // Leave "" and the badge is hidden — do not invent a number.
  licenseNumber: "",

  // Years in business — used in the About copy. Set to 0 to hide.
  foundedYear: 0, // TODO: e.g. 2018
} as const;

export type Service = {
  slug: string;
  title: string;
  blurb: string;
  bullets: string[];
  icon: IconName;
};

export type IconName =
  | "hammer"
  | "wrench"
  | "paint"
  | "key"
  | "ruler"
  | "shield";

export const services: Service[] = [
  {
    slug: "remodeling",
    title: "Remodeling & Renovation",
    blurb:
      "Kitchens, baths, and whole-home refreshes built for coastal living and heavy rental use.",
    bullets: [
      "Kitchen & bathroom remodels",
      "Tile, flooring & backsplash",
      "Cabinetry and built-ins",
      "Trim, doors & finish carpentry",
    ],
    icon: "hammer",
  },
  {
    slug: "maintenance",
    title: "Property Maintenance",
    blurb:
      "Scheduled upkeep that catches small problems before they become expensive ones.",
    bullets: [
      "Recurring maintenance plans",
      "Drywall & paint touch-ups",
      "Fixture, fan & hardware replacement",
      "Pressure washing & exterior care",
    ],
    icon: "wrench",
  },
  {
    slug: "rental-turnovers",
    title: "Vacation Rental Turnovers",
    blurb:
      "Fast, reliable repairs between guests so your calendar never goes dark.",
    bullets: [
      "Same-week punch lists",
      "Damage repair between bookings",
      "Furniture & appliance install",
      "Coordination with property managers",
    ],
    icon: "key",
  },
  {
    slug: "painting",
    title: "Painting & Drywall",
    blurb:
      "Interior and exterior finishes that hold up to salt air, sun, and humidity.",
    bullets: [
      "Interior repaints",
      "Exterior & trim painting",
      "Drywall repair & texture matching",
      "Popcorn removal & smooth finish",
    ],
    icon: "paint",
  },
  {
    slug: "carpentry",
    title: "Carpentry & Decks",
    blurb:
      "Outdoor living spaces and custom woodwork built to survive the Gulf coast.",
    bullets: [
      "Deck & boardwalk repair",
      "Railings, stairs & gates",
      "Pergolas and outdoor showers",
      "Rot repair & board replacement",
    ],
    icon: "ruler",
  },
  {
    slug: "punch-lists",
    title: "Punch Lists & Handyman",
    blurb:
      "One call for the running list of small jobs you've been meaning to get to.",
    bullets: [
      "Honey-do and punch lists",
      "Shelving, mounting & assembly",
      "Caulking, sealing & weatherproofing",
      "Minor plumbing & electrical fixtures",
    ],
    icon: "shield",
  },
];

/**
 * Optional. Real testimonials only — add them as you collect them.
 * The section hides itself entirely when this array is empty.
 */
export const testimonials: { quote: string; author: string; role?: string }[] =
  [];
