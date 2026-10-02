"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CloseIcon, ExternalIcon, SearchIcon } from "./icons";
import { STATUS_LABEL, formatDate, websiteHref } from "./format";
import styles from "./Admin.module.css";

const FILTERS = ["all", "new", "contacted", "archived"];

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openLead, setOpenLead] = useState(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error: loadError } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) setError(loadError.message);
    else setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!openLead) return;
    const onKey = (e) => e.key === "Escape" && setOpenLead(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openLead]);

  async function setStatus(lead, status) {
    if (status === lead.status) return;
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", lead.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    setOpenLead((prev) => (prev?.id === lead.id ? { ...prev, status } : prev));
  }

  async function remove(lead) {
    if (!window.confirm(`Delete the enquiry from ${lead.name}? This cannot be undone.`))
      return;
    setError("");
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("leads")
      .delete()
      .eq("id", lead.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setOpenLead((prev) => (prev?.id === lead.id ? null : prev));
  }

  const q = query.trim().toLowerCase();
  const shown = leads.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (!q) return true;
    return [l.name, l.business_name, l.email, l.phone, l.business_type, l.message]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q));
  });

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Leads</h1>
          <p className={styles.pageLead}>
            Every wholesale enquiry submitted through the website.
          </p>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.tabs} role="tablist" aria-label="Filter by status">
            {FILTERS.map((key) => {
              const n = key === "all" ? leads.length : leads.filter((l) => l.status === key).length;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={filter === key}
                  className={`${styles.tab} ${filter === key ? styles.tabActive : ""}`}
                  onClick={() => setFilter(key)}
                >
                  {key === "all" ? "All" : STATUS_LABEL[key]}
                  <span className={styles.tabCount}>{n}</span>
                </button>
              );
            })}
          </div>

          <label className={styles.search}>
            <SearchIcon size={16} />
            <input
              type="search"
              placeholder="Search leads…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search leads"
            />
          </label>
        </div>

        {loading ? (
          <p className={styles.tableEmpty}>Loading…</p>
        ) : shown.length === 0 ? (
          <p className={styles.tableEmpty}>
            {leads.length === 0
              ? "No enquiries yet. They will appear here as they come in."
              : "No leads match this filter."}
          </p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th className={styles.thActions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((lead) => (
                  <tr key={lead.id}>
                    <td data-label="Business">
                      <button
                        type="button"
                        className={styles.cellButton}
                        onClick={() => setOpenLead(lead)}
                      >
                        {lead.business_name || lead.name}
                      </button>
                      <span className={styles.cellSub}>{lead.name}</span>
                    </td>
                    <td data-label="Contact">
                      <a className={styles.leadLink} href={`mailto:${lead.email}`}>
                        {lead.email}
                      </a>
                      {lead.phone && (
                        <a
                          className={styles.cellSubLink}
                          href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                        >
                          {lead.phone}
                        </a>
                      )}
                    </td>
                    <td data-label="Type">{lead.business_type || "—"}</td>
                    <td data-label="Status">
                      <select
                        className={`${styles.statusSelect} ${styles[`badge_${lead.status}`] || ""}`}
                        value={lead.status}
                        onChange={(e) => setStatus(lead, e.target.value)}
                        aria-label={`Status for ${lead.name}`}
                      >
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td data-label="Received" className={styles.cellMuted}>
                      {formatDate(lead.created_at)}
                    </td>
                    <td data-label="Actions" className={styles.tdActions}>
                      <button
                        type="button"
                        className={styles.smallBtn}
                        onClick={() => setOpenLead(lead)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className={`${styles.smallBtn} ${styles.dangerBtn}`}
                        onClick={() => remove(lead)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && shown.length > 0 && (
          <p className={styles.tableFoot}>
            Showing {shown.length} of {leads.length}{" "}
            {leads.length === 1 ? "enquiry" : "enquiries"}
          </p>
        )}
      </section>

      {openLead && (
        <div className={styles.modalBackdrop} onClick={() => setOpenLead(null)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHead}>
              <div>
                <h2 id="lead-title" className={styles.modalTitle}>
                  {openLead.business_name || openLead.name}
                </h2>
                <p className={styles.cellMuted}>{formatDate(openLead.created_at)}</p>
              </div>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setOpenLead(null)}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <dl className={styles.details}>
              <dt>Contact</dt>
              <dd>{openLead.name}</dd>
              <dt>Email</dt>
              <dd>
                <a className={styles.leadLink} href={`mailto:${openLead.email}`}>
                  {openLead.email}
                </a>
              </dd>
              {openLead.phone && (
                <>
                  <dt>Phone</dt>
                  <dd>
                    <a
                      className={styles.leadLink}
                      href={`tel:${openLead.phone.replace(/[^\d+]/g, "")}`}
                    >
                      {openLead.phone}
                    </a>
                  </dd>
                </>
              )}
              {openLead.business_type && (
                <>
                  <dt>Business type</dt>
                  <dd>{openLead.business_type}</dd>
                </>
              )}
              {openLead.website && (
                <>
                  <dt>Website</dt>
                  <dd>
                    <a
                      className={styles.leadLink}
                      href={websiteHref(openLead.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {openLead.website} <ExternalIcon size={12} />
                    </a>
                  </dd>
                </>
              )}
              <dt>Status</dt>
              <dd>
                <select
                  className={`${styles.statusSelect} ${styles[`badge_${openLead.status}`] || ""}`}
                  value={openLead.status}
                  onChange={(e) => setStatus(openLead, e.target.value)}
                  aria-label="Status"
                >
                  {Object.entries(STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </dd>
            </dl>

            {openLead.message && (
              <>
                <p className={styles.label}>Message</p>
                <p className={styles.leadMessage}>{openLead.message}</p>
              </>
            )}

            <div className={styles.modalActions}>
              <a className={styles.primaryBtnInline} href={`mailto:${openLead.email}`}>
                Reply by email
              </a>
              <button
                type="button"
                className={`${styles.smallBtn} ${styles.dangerBtn}`}
                onClick={() => remove(openLead)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
