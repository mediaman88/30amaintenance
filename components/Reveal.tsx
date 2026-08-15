"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Adds `.is-visible` to any `.reveal` element as it scrolls into view.
 *
 * A plain querySelectorAll on mount is not enough: elements added later — the
 * albums appended by "Load more projects", for instance — would never be
 * observed and would sit at opacity 0 forever, looking like a dead button. So
 * a MutationObserver picks up anything added after the first pass.
 *
 * Under prefers-reduced-motion the CSS already shows everything, so this bails
 * out and does nothing.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );

    const observe = (root: Element | Document) => {
      if (
        root instanceof Element &&
        root.classList.contains("reveal") &&
        !root.classList.contains("is-visible")
      ) {
        io.observe(root);
      }
      root
        .querySelectorAll(".reveal:not(.is-visible)")
        .forEach((el) => io.observe(el));
    };

    observe(document);

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) observe(node as Element);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
