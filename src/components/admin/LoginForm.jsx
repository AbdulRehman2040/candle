"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./Admin.module.css";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      /* Deliberately vague: saying which half was wrong tells someone
         probing the form whether an address has an account. */
      setError("Those details were not recognised.");
      setBusy(false);
      return;
    }

    router.push(params.get("next") || "/admin");
    router.refresh();
  }

  return (
    <div className={styles.loginPage}>
      <form className={styles.loginCard} onSubmit={onSubmit}>
        <p className={styles.loginEyebrow}>Fondue Flame</p>
        <h1 className={styles.loginTitle}>Admin sign in</h1>

        <label className={styles.label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label className={styles.label} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" className={styles.primaryBtn} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className={styles.hint}>
          SECURE LOGIN 
        </p>
      </form>
    </div>
  );
}
