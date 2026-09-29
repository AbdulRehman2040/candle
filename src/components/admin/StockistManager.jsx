"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Admin.module.css";

const REGIONS = [
  "London & the South East",
  "The South West",
  "The Midlands",
  "The North",
  "Scotland, Wales & NI",
  "Other",
];

const BLANK = {
  name: "",
  street: "",
  town: "",
  postcode: "",
  phone: "",
  region: REGIONS[0],
  website: "",
  logo_url: "",
};

export default function StockistManager() {
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data, error: loadError } = await supabase
      .from("stockists")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (loadError) setError(loadError.message);
    else setShops(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(shop) {
    setEditingId(shop.id);
    setForm({
      name: shop.name || "",
      street: shop.street || "",
      town: shop.town || "",
      postcode: shop.postcode || "",
      phone: shop.phone || "",
      region: shop.region || REGIONS[0],
      website: shop.website || "",
      logo_url: shop.logo_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(BLANK);
    setError("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim() || !form.street.trim() || !form.town.trim() || !form.postcode.trim()) {
      setError("Shop name, street, town and postcode are all required.");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const payload = {
      name: form.name.trim(),
      street: form.street.trim(),
      town: form.town.trim(),
      postcode: form.postcode.trim().toUpperCase(),
      phone: form.phone.trim() || null,
      region: form.region,
      website: form.website.trim() || null,
      logo_url: form.logo_url.trim() || null,
    };

    const { error: saveError } = editingId
      ? await supabase.from("stockists").update(payload).eq("id", editingId)
      : await supabase.from("stockists").insert(payload);

    if (saveError) {
      setError(saveError.message);
      setBusy(false);
      return;
    }

    setMessage(editingId ? "Shop updated." : `${payload.name} added.`);
    setForm(BLANK);
    setEditingId(null);
    setBusy(false);
    load();
  }

  async function remove(shop) {
    if (
      !window.confirm(
        `Delete ${shop.name}? This removes it from the website straight away and cannot be undone.`
      )
    )
      return;

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("stockists")
      .delete()
      .eq("id", shop.id);

    if (deleteError) setError(deleteError.message);
    else {
      setMessage(`${shop.name} deleted.`);
      load();
    }
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Where to Buy</h1>
      <p className={styles.pageLead}>
        Shops listed here appear on the website. Add the real stockists and
        delete the demo rows when you are ready.
      </p>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.split}>
        {/* --- Add / edit ------------------------------------------- */}
        <form className={styles.panel} onSubmit={onSubmit}>
          <p className={styles.panelTitle}>
            {editingId ? "Edit shop" : "Add a shop"}
          </p>

          <label className={styles.label} htmlFor="name">Shop name</label>
          <input id="name" className={styles.input} value={form.name}
            onChange={(e) => set("name", e.target.value)} required />

          <label className={styles.label} htmlFor="street">Street</label>
          <input id="street" className={styles.input} value={form.street}
            onChange={(e) => set("street", e.target.value)} required />

          <div className={styles.row2}>
            <div>
              <label className={styles.label} htmlFor="town">Town</label>
              <input id="town" className={styles.input} value={form.town}
                onChange={(e) => set("town", e.target.value)} required />
            </div>
            <div>
              <label className={styles.label} htmlFor="postcode">Postcode</label>
              <input id="postcode" className={styles.input} value={form.postcode}
                onChange={(e) => set("postcode", e.target.value)} required />
            </div>
          </div>

          <label className={styles.label} htmlFor="phone">Phone</label>
          <input id="phone" className={styles.input} value={form.phone}
            onChange={(e) => set("phone", e.target.value)} />

          <label className={styles.label} htmlFor="region">Region</label>
          <select id="region" className={styles.select} value={form.region}
            onChange={(e) => set("region", e.target.value)}>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <label className={styles.label} htmlFor="website">Website</label>
          <input id="website" className={styles.input} value={form.website}
            placeholder="https://" onChange={(e) => set("website", e.target.value)} />

          <label className={styles.label} htmlFor="logo_url">Logo URL</label>
          <input id="logo_url" className={styles.input} value={form.logo_url}
            placeholder="Leave blank to use initials"
            onChange={(e) => set("logo_url", e.target.value)} />

          <button type="submit" className={styles.primaryBtn} disabled={busy}>
            {busy ? "Saving…" : editingId ? "Save changes" : "Add shop"}
          </button>

          {editingId && (
            <button
              type="button"
              className={styles.smallBtn}
              style={{ marginTop: "0.75rem", width: "100%" }}
              onClick={cancelEdit}
            >
              Cancel
            </button>
          )}
        </form>

        {/* --- List -------------------------------------------------- */}
        <div>
          <p className={styles.count}>
            {loading
              ? "Loading…"
              : `${shops.length} ${shops.length === 1 ? "shop" : "shops"}`}
          </p>

          {!loading && shops.length === 0 ? (
            <p className={styles.empty}>
              No shops yet. Add the first one using the form.
            </p>
          ) : (
            <ul className={styles.records}>
              {shops.map((shop) => (
                <li key={shop.id} className={styles.record}>
                  <div>
                    <p className={styles.recordName}>{shop.name}</p>
                    <p className={styles.recordMeta}>
                      {shop.street}, {shop.town}, {shop.postcode}
                      {shop.phone && <> · {shop.phone}</>}
                    </p>
                    <span className={styles.recordTag}>{shop.region}</span>
                  </div>
                  <div className={styles.recordActions}>
                    <button type="button" className={styles.smallBtn}
                      onClick={() => startEdit(shop)}>
                      Edit
                    </button>
                    <button type="button"
                      className={`${styles.smallBtn} ${styles.dangerBtn}`}
                      onClick={() => remove(shop)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
