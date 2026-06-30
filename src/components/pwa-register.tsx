"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (public/sw.js) in the browser.
 *
 * Only runs in production: a service worker in `next dev` can fight Turbopack's
 * HMR and serve stale chunks. Test installability with `next build && next start`.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
