"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Admin.module.css";

const BLANK = {
  name: "",
  street: "",
  town: "",
  postcode: "",
  phone: "",
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
  const [uploading, setUploading] = useState(false);

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

  /* Uploads the chosen file to the stockist-logos bucket and stores the
     public URL on the form. Keeps the old URL if anything fails, so a bad
     upload cannot silently blank an existing logo. */
  async function onLogoFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("That file is not an image.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be 2MB or smaller.");
      event.target.value = "";
      return;
    }

    setError("");
    setUploading(true);

    const supabase = createClient();
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("stockist-logos")
      .upload(path, file, { cacheControl: "31536000", upsert: false });

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      event.target.value = "";
      return;
    }

    const { data } = supabase.storage.from("stockist-logos").getPublicUrl(path);
    set("logo_url", data.publicUrl);
    setUploading(false);
    event.target.value = "";
  }

  function startEdit(shop) {
    setEditingId(shop.id);
    setForm({
      name: shop.name || "",
      street: shop.street || "",
      town: shop.town || "",
      postcode: shop.postcode || "",
      phone: shop.phone || "",
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

          <label className={styles.label} htmlFor="website">Website</label>
          <input id="website" className={styles.input} value={form.website}
            placeholder="https://" onChange={(e) => set("website", e.target.value)} />

          <label className={styles.label} htmlFor="logo_file">Logo</label>
          <div className={styles.logoRow}>
            <span className={styles.logoPreview}>
              {form.logo_url ? (
                /* Plain img: the bucket host is not in next.config images */
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo_url} alt="" className={styles.logoThumb} />
              ) : (
                <span className={styles.logoEmpty}>None</span>
              )}
            </span>
            <div className={styles.logoControls}>
              <input
                id="logo_file"
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={onLogoFile}
                disabled={uploading}
              />
              {form.logo_url && (
                <button type="button" className={styles.smallBtn}
                  onClick={() => set("logo_url", "")}>
                  Remove logo
                </button>
              )}
              <p className={styles.fileHint}>
                {uploading ? "Uploading…" : "PNG or JPG, up to 2MB. Optional — initials are used when there is no logo."}
              </p>
            </div>
          </div>

          <button type="submit" className={styles.primaryBtn} disabled={busy || uploading}>
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
