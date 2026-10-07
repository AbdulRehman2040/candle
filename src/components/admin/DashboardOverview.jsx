"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowIcon, LeadsIcon, StoreIcon } from "./icons";
import { STATUS_LABEL, formatDate } from "./format";
import styles from "./Admin.module.css";

export default function DashboardOverview() {
  const [leads, setLeads] = useState([]);
  const [shopCount, setShopCount] = useState(0);
  const [thisWeek, setThisWeek] = useState(0);
  const [comingSoon, setComingSoon] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("leads")
        .select("id, name, business_name, email, status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("stockists").select("id", { count: "exact", head: true }),
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "stockists_coming_soon")
        .maybeSingle(),
    ]).then(([leadRes, shopRes, settingRes]) => {
      setComingSoon(settingRes.error || !settingRes.data ? true : settingRes.data.value !== false);
      if (leadRes.error) setError(leadRes.error.message);
      else {
        const rows = leadRes.data || [];
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        setLeads(rows);
        setThisWeek(rows.filter((l) => new Date(l.created_at).getTime() >= weekAgo).length);
      }
      if (shopRes.error) setError(shopRes.error.message);
      else setShopCount(shopRes.count || 0);
      setLoading(false);
    });
  }, []);

  const count = (status) => leads.filter((l) => l.status === status).length;

  const stats = [
    { label: "Total leads", value: leads.length, note: `${thisWeek} in the last 7 days` },
    { label: "New leads", value: count("new"), note: "Waiting for a reply", accent: true },
    { label: "Contacted", value: count("contacted"), note: `${count("archived")} archived` },
    { label: "Shops listed", value: shopCount, note: comingSoon ? "Page shows “Coming soon”" : "Live on Where to Buy" },
  ];

  const recent = leads.slice(0, 5);

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageLead}>An overview of enquiries and stockists.</p>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={`${styles.stat} ${s.accent ? styles.statAccent : ""}`}>
            <p className={styles.statLabel}>{s.label}</p>
            <p className={styles.statValue}>{loading ? "–" : s.value}</p>
            <p className={styles.statNote}>{loading ? "Loading…" : s.note}</p>
          </div>
        ))}
      </div>

      <div className={styles.overviewGrid}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Recent leads</h2>
            <Link href="/admin/leads" className={styles.cardLink}>
              View all <ArrowIcon size={14} />
            </Link>
          </div>

          {loading ? (
            <p className={styles.tableEmpty}>Loading…</p>
          ) : recent.length === 0 ? (
            <p className={styles.tableEmpty}>No enquiries yet.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((lead) => (
                    <tr key={lead.id}>
                      <td data-label="Business">
                        <span className={styles.cellStrong}>{lead.business_name || lead.name}</span>
                        <span className={styles.cellSub}>{lead.name}</span>
                      </td>
                      <td data-label="Email">
                        <a className={styles.leadLink} href={`mailto:${lead.email}`}>
                          {lead.email}
                        </a>
                      </td>
                      <td data-label="Status">
                        <span className={`${styles.badge} ${styles[`badge_${lead.status}`] || ""}`}>
                          {STATUS_LABEL[lead.status] || lead.status}
                        </span>
                      </td>
                      <td data-label="Received" className={styles.cellMuted}>
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={styles.quickCol}>
          <Link href="/admin/leads" className={styles.quick}>
            <span className={styles.quickIcon}><LeadsIcon /></span>
            <span>
              <span className={styles.quickTitle}>Manage leads</span>
              <span className={styles.quickText}>Reply to and track wholesale enquiries.</span>
            </span>
          </Link>
          <Link href="/admin/stockists" className={styles.quick}>
            <span className={styles.quickIcon}><StoreIcon /></span>
            <span>
              <span className={styles.quickTitle}>Where to Buy</span>
              <span className={styles.quickText}>Add, edit or remove shops on the website.</span>
            </span>
          </Link>
        </section>
      </div>
    </>
  );
}
