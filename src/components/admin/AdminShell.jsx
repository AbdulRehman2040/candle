"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./Admin.module.css";

const NAV = [
  { href: "/admin", label: "Where to Buy" },
  { href: "/admin/leads", label: "Leads" },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  /* The login page renders on its own — no bar, no nav. */
  if (pathname === "/admin/login") return children;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        {/* Plain label, not a link — the bar carries only the two
            destinations: Where to Buy and Leads. */}
        <span className={styles.brand}>Fondue Flame</span>
        <nav className={styles.nav}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${
                pathname === item.href ? styles.navActive : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button type="button" className={styles.signOut} onClick={signOut}>
          Sign out
        </button>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
