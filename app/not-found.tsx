import Link from "next/link";
import { ArrowIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gulf-600">
        404
      </p>
      <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        That page took a wrong turn off 30A.
      </h1>
      <p className="mt-4 max-w-md text-pretty leading-relaxed text-ink-800/70">
        The page you were after doesn&apos;t exist — or it moved. Here are the
        ways back.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-sm font-semibold text-sand-50 shadow-lift transition-all hover:bg-ink-800"
        >
          Back home
          <ArrowIcon className="h-4 w-4" />
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink-900 ring-1 ring-sand-200 transition-colors hover:bg-sand-100"
        >
          Contact us
        </Link>
      </div>
    </section>
  );
}
