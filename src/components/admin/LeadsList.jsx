"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Admin.module.css";

const STATUS_CLASS = {
  new: styles.statusNew,
  contacted: styles.statusContacted,
  archived: styles.statusArchived,
};

const NEXT_STATUS = { new: "contacted", contacted: "archived", archived: "new" };

function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadsList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

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

  async function cycleStatus(lead) {
    const next = NEXT_STATUS[lead.status] || "new";
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("leads")
      .update({ status: next })
      .eq("id", lead.id);

    if (updateError) setError(updateError.message);
    else setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, status: next } : l))
    );
  }

  async function remove(lead) {
    if (!window.confirm(`Delete the enquiry from ${lead.name}? This cannot be undone.`))
      return;
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("leads")
      .delete()
      .eq("id", lead.id);

    if (deleteError) setError(deleteError.message);
    else setLeads((prev) => prev.filter((l) => l.id !== lead.id));
  }

  const shown =
    filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <>
      <h1 className={styles.pageTitle}>Leads</h1>
      <p className={styles.pageLead}>
        Every wholesale enquiry submitted through the website.
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {["all", "new", "contacted", "archived"].map((key) => (
          <button
            key={key}
            type="button"
            className={styles.smallBtn}
            style={
              filter === key
                ? { background: "#2a1813", color: "#fdfaf5" }
                : undefined
            }
            onClick={() => setFilter(key)}
          >
            {key[0].toUpperCase() + key.slice(1)}
            {key !== "all" && ` (${leads.filter((l) => l.status === key).length})`}
          </button>
        ))}
      </div>

      <p className={styles.count}>
        {loading
          ? "Loading…"
          : `${shown.length} ${shown.length === 1 ? "enquiry" : "enquiries"}`}
      </p>

      {!loading && shown.length === 0 ? (
        <p className={styles.empty}>
          {filter === "all"
            ? "No enquiries yet. They will appear here as they come in."
            : `No ${filter} enquiries.`}
        </p>
      ) : (
        <ul className={styles.records}>
          {shown.map((lead) => (
            <li key={lead.id} className={styles.record}>
              <div>
                <div className={styles.leadTop}>
                  <p className={styles.recordName}>
                    {lead.business_name || lead.name}
                  </p>
                  <span className={styles.leadDate}>
                    {formatDate(lead.created_at)}
                  </span>
                </div>

                <p className={styles.recordMeta}>
                  {lead.name}
                  {" · "}
                  <a className={styles.leadLink} href={`mailto:${lead.email}`}>
                    {lead.email}
                  </a>
                  {lead.phone && (
                    <>
                      {" · "}
                      <a className={styles.leadLink} href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}>
                        {lead.phone}
                      </a>
                    </>
                  )}
                  {lead.website && (
                    <>
                      {" · "}
                      <a
                        className={styles.leadLink}
                        href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </a>
                    </>
                  )}
                </p>

                <span
                  className={`${styles.recordTag} ${STATUS_CLASS[lead.status] || ""}`}
                >
                  {lead.status}
                </span>
                {lead.business_type && (
                  <span className={styles.recordTag} style={{ marginLeft: "0.375rem" }}>
                    {lead.business_type}
                  </span>
                )}

                {lead.message && (
                  <p className={styles.leadMessage}>{lead.message}</p>
                )}
              </div>

              <div className={styles.recordActions}>
                <button type="button" className={styles.smallBtn}
                  onClick={() => cycleStatus(lead)}>
                  Mark {NEXT_STATUS[lead.status] || "new"}
                </button>
                <button type="button"
                  className={`${styles.smallBtn} ${styles.dangerBtn}`}
                  onClick={() => remove(lead)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
