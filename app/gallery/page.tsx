import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import { categoryFor, getCategories, getPhotos, getSyncInfo } from "@/lib/gallery";
import { site } from "@/site.config";
import { InstagramIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Our Work",
  description: `Project photos from ${site.name} — remodeling, repairs, and maintenance across Scenic 30A and South Walton, Florida.`,
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  const photos = getPhotos();
  const categories = getCategories();
  const { syncedAt } = getSyncInfo();

  // Categories are derived from hashtags on the server so the client component
  // doesn't need the mapping tables.
  const categoryById = Object.fromEntries(
    photos.map((photo) => [photo.id, categoryFor(photo)]),
  );

  return (
    <>
      <section className="border-b border-paper-200 bg-white">
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-5xl">
              Our work
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-navy-800/70">
              {photos.length > 0
                ? `${photos.length} photos from real jobs across 30A — remodels, repairs, turnovers, and everything in between.`
                : "Photos from real jobs across 30A — remodels, repairs, turnovers, and everything in between."}
            </p>
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-paper-100 px-5 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-paper-200 transition-colors hover:bg-paper-200"
            >
              <InstagramIcon className="h-4 w-4 text-navy-700" />
              Follow {site.social.instagramHandle}
            </a>
          </div>
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <GalleryGrid
          photos={photos}
          categories={categories}
          categoryById={categoryById}
        />

        {syncedAt && (
          <p className="mt-14 text-center text-xs text-navy-800/40">
            Last synced from Instagram{" "}
            <time dateTime={syncedAt}>
              {new Date(syncedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </p>
        )}
      </section>
    </>
  );
}
