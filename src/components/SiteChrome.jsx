"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* The dashboard has its own bar, so the public header and footer are kept
   off every /admin route. */
function isAdmin(pathname) {
  return pathname?.startsWith("/admin");
}

export function SiteHeader() {
  return isAdmin(usePathname()) ? null : <Header />;
}

export function SiteFooter() {
  return isAdmin(usePathname()) ? null : <Footer />;
}
