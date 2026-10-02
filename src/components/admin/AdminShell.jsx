"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CloseIcon,
  DashboardIcon,
  LeadsIcon,
  LogoutIcon,
  MenuIcon,
  StoreIcon,
} from "./icons";
import styles from "./Admin.module.css";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: DashboardIcon },
  { href: "/admin/leads", label: "Leads", Icon: LeadsIcon },
  { href: "/admin/stockists", label: "Where to Buy", Icon: StoreIcon },
];

function isActive(pathname, href) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const onLogin = pathname === "/admin/login";

  useEffect(() => {
    if (onLogin) return;
    createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email || ""));
  }, [onLogin]);

  /* Escape closes the drawer; the page behind it must not scroll. */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* The login page renders on its own — no sidebar, no header. */
  if (onLogin) return children;

  async function signOut() {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const current = NAV.find((item) => isActive(pathname, item.href));

  return (
    <div className={styles.shell}>
      <aside
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}
        aria-label="Admin navigation"
      >
        <div className={styles.sidebarHead}>
          <Link
            href="/admin"
            className={styles.sidebarLogo}
            aria-label="Fondue Flame dashboard"
            onClick={() => setMenuOpen(false)}
          >
            <Image
              src="/logo-admin.png"
              alt="Fondue Flame"
              width={800}
              height={331}
              priority
              className={styles.sidebarLogoImg}
            />
          </Link>
          <button
            type="button"
            className={styles.sidebarClose}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <p className={styles.sidebarLabel}>Menu</p>
        <nav className={styles.sideNav}>
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.sideLink} ${active ? styles.sideLinkActive : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <Link href="/" className={styles.viewSite} target="_blank" rel="noopener noreferrer">
            View website ↗
          </Link>
          <button
            type="button"
            className={styles.sideSignOut}
            onClick={signOut}
            disabled={signingOut}
          >
            <LogoutIcon />
            <span>{signingOut ? "Logging out…" : "Log out"}</span>
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={styles.content}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <MenuIcon size={20} />
          </button>

          <div className={styles.topTitle}>
            <span className={styles.crumb}>Admin</span>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCurrent}>{current?.label || "Dashboard"}</span>
          </div>

          <div className={styles.topRight}>
            {email && (
              <span className={styles.user}>
                <span className={styles.avatar} aria-hidden="true">
                  {email[0].toUpperCase()}
                </span>
                <span className={styles.userEmail}>{email}</span>
              </span>
            )}
            <button
              type="button"
              className={styles.topSignOut}
              onClick={signOut}
              disabled={signingOut}
            >
              <LogoutIcon size={16} />
              <span className={styles.topSignOutText}>Log out</span>
            </button>
          </div>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
