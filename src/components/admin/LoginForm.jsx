"use client";

import { useState } from "react";
import Image from "next/image";
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
      <section className={styles.loginBrand} aria-hidden="true">
        <Image
          src="/logo-admin.png"
          alt=""
          width={800}
          height={331}
          priority
          className={styles.loginBrandLogo}
        />
        <p className={styles.loginBrandText}>
          Manage wholesale enquiries and the shops that stock Fondue Flame.
        </p>
      </section>

      <div className={styles.loginFormWrap}>
        <form className={styles.loginCard} onSubmit={onSubmit}>
          <Image
            src="/colored-logo.png"
            alt="Fondue Flame"
            width={1997}
            height={788}
            priority
            className={styles.loginLogo}
          />
          <p className={styles.loginEyebrow}>Admin dashboard</p>
          <h1 className={styles.loginTitle}>Welcome back</h1>
          <p className={styles.loginSub}>Sign in to continue.</p>

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
            placeholder="you@fondueflame.com"
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
            placeholder="••••••••"
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

          <p className={styles.hint}>🔒 Secure login</p>
        </form>
      </div>
    </div>
  );
}
