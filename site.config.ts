/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT THIS FILE FIRST.
 *  Everything the site displays about your business lives here.
 *  Anything marked TODO is a placeholder — replace it before launch.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: "30A Maintenance",
  legalName: "30A Maintenance", // TODO: your registered LLC / DBA name
  tagline: "Remodeling & Property Maintenance on Scenic 30A",
  description:
    "Remodeling, repairs, and year-round property maintenance for homes and vacation rentals along Scenic Highway 30A and South Walton, Florida.",

  // Used for canonical URLs, sitemap, and Open Graph tags.
  // Set NEXT_PUBLIC_SITE_URL in Vercel to your real domain and this follows it.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://30amaintenance.com", // TODO: confirm domain

  contact: {
    phone: "(850) 555-0134", // TODO: real phone
    phoneHref: "tel:+18505550134", // TODO: real phone, E.164 format
    email: "hello@30amaintenance.com", // TODO: real email
    // Where the contact form sends to. Falls back to contact.email.
    formRecipient: "hello@30amaintenance.com", // TODO
  },

  social: {
    instagram: "https://www.instagram.com/30a.maintenance/",
    instagramHandle: "@30a.maintenance",
    facebook: "", // optional — leave "" to hide
  },

  // Service area. Drives the footer, the local-business schema, and SEO copy.
  location: {
    // A physical street address improves local SEO, but only list one you
    // actually operate from. Leave street blank to publish as a service-area
    // business (recommended for mobile contractors).
    street: "",
    city: "Santa Rosa Beach",
    region: "FL",
    regionName: "Florida",
    postalCode: "32459", // TODO: confirm
    country: "US",
    // Approximate center of the service area (Santa Rosa Beach, FL).
    latitude: 30.3652,
    longitude: -86.2233,
    serviceRadiusMiles: 30,
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
  ],

  hours: {
    weekdays: "Mon–Fri, 7:30am – 5:00pm",
    saturday: "Sat, by appointment",
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
