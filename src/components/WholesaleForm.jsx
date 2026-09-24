"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import styles from "./WholesaleForm.module.css";

const BUSINESS_TYPES = [
  "Retailer",
  "Gift Shop",
  "Hospitality",
  "Distributor / Wholesaler",
  "Other",
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Only the fields the brief marks as required are validated. */
const RULES = {
  businessName: (v) => (v.trim() ? "" : "Please enter your business name."),
  contactName: (v) => (v.trim() ? "" : "Please enter your name."),
  email: (v) =>
    !v.trim()
      ? "Please enter your business email address."
      : EMAIL.test(v.trim())
        ? ""
        : "Please enter a valid email address.",
  businessType: (v) => (v ? "" : "Please select your business type."),
  location: (v) => (v.trim() ? "" : "Please enter your location."),
};

export default function WholesaleForm() {
  const [values, setValues] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    businessType: "",
    location: "",
    quantity: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | sending | sent | failed
  const formRef = useRef(null);

  const update = (name) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    /* Clear an error as soon as the field becomes valid again */
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const message = RULES[name] ? RULES[name](value) : "";
      if (message) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const blur = (name) => () => {
    if (!RULES[name]) return;
    const message = RULES[name](values[name]);
    setErrors((prev) => (message ? { ...prev, [name]: message } : prev));
  };

  async function onSubmit(event) {
    event.preventDefault();
    if (state === "sending") return; /* no duplicate submissions */

    const found = {};
    for (const [name, rule] of Object.entries(RULES)) {
      const message = rule(values[name]);
      if (message) found[name] = message;
    }
    setErrors(found);

    if (Object.keys(found).length) {
      /* Send focus to the first problem, leaving every entry intact */
      const first = Object.keys(found)[0];
      formRef.current?.elements[first]?.focus();
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/wholesale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
    } catch {
      setState("failed");
    }
  }

  if (state === "sent") {
    return (
      <div className={styles.panel}>
        <div className={styles.sent}>
          <svg className={styles.sentFlame} viewBox="0 0 120 170" aria-hidden="true">
            <path
              d="M60 4C60 42 96 60 96 100c0 26-16 46-36 46S24 126 24 100C24 74 44 62 52 40c2 22 18 26 18 48 0 14-8 22-16 24 14 2 26-10 26-28C80 58 66 36 60 4Z"
              fill="#b9673e"
            />
          </svg>
          <h2 className={styles.sentTitle}>Thank you for your enquiry.</h2>
          <p className={styles.sentText}>
            We’ve received your details and will be in touch.
          </p>
          <Link href="/" className={styles.sentCta}>
            Return home
          </Link>
        </div>
      </div>
    );
  }

  const field = (name, label, props = {}) => {
    const invalid = Boolean(errors[name]);
    const id = `wf-${name}`;
    return (
      <p className={`${styles.field} ${props.wide ? styles.wide : ""}`}>
        <label className={styles.label} htmlFor={id}>
          {label} {props.required && <span className={styles.req}>*</span>}
        </label>
        <input
          className={`${styles.input} ${invalid ? styles.invalid : ""}`}
          id={id}
          name={name}
          type={props.type || "text"}
          value={values[name]}
          onChange={update(name)}
          onBlur={blur(name)}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          autoComplete={props.autoComplete}
          inputMode={props.inputMode}
          placeholder={props.placeholder}
        />
        {invalid && (
          <span className={styles.error} id={`${id}-error`}>
            {errors[name]}
          </span>
        )}
      </p>
    );
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.formTitle}>Wholesale Enquiry</h2>
      <p className={styles.formNote}>
        Fields marked <span className={styles.req}>*</span> are required.
      </p>

      <form className={styles.form} ref={formRef} onSubmit={onSubmit} noValidate>
        {field("businessName", "Business Name", {
          required: true,
          autoComplete: "organization",
        })}
        {field("contactName", "Contact Name", {
          required: true,
          autoComplete: "name",
        })}
        {field("email", "Business Email", {
          required: true,
          type: "email",
          autoComplete: "email",
          inputMode: "email",
        })}
        {field("phone", "Phone Number", {
          type: "tel",
          autoComplete: "tel",
          inputMode: "tel",
        })}
        {field("website", "Website / Social Media", {
          placeholder: "fondueflame.co.uk or @fondueflame",
        })}

        <p className={styles.field}>
          <label className={styles.label} htmlFor="wf-businessType">
            Business Type <span className={styles.req}>*</span>
          </label>
          <select
            className={`${styles.select} ${errors.businessType ? styles.invalid : ""}`}
            id="wf-businessType"
            name="businessType"
            value={values.businessType}
            onChange={update("businessType")}
            onBlur={blur("businessType")}
            aria-invalid={Boolean(errors.businessType) || undefined}
            aria-describedby={
              errors.businessType ? "wf-businessType-error" : undefined
            }
          >
            <option value="">Please select</option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.businessType && (
            <span className={styles.error} id="wf-businessType-error">
              {errors.businessType}
            </span>
          )}
        </p>

        {field("location", "Location", {
          required: true,
          autoComplete: "address-level2",
          placeholder: "Town or city, country",
        })}
        {field("quantity", "Estimated Order Quantity", { inputMode: "numeric" })}

        <p className={`${styles.field} ${styles.wide}`}>
          <label className={styles.label} htmlFor="wf-message">
            Message
          </label>
          <textarea
            className={styles.textarea}
            id="wf-message"
            name="message"
            rows={6}
            value={values.message}
            onChange={update("message")}
            placeholder="Tell us a little about your business and your interest in Fondue Flame."
          />
        </p>

        {state === "failed" && (
          <p className={styles.formError} role="alert">
            Sorry, your enquiry could not be sent just now. Please try again
            in a moment.
          </p>
        )}

        <div className={styles.foot}>
          <button
            className={styles.submit}
            type="submit"
            disabled={state === "sending"}
          >
            {state === "sending" ? "Sending…" : "Submit wholesale enquiry"}
            {state !== "sending" && (
              <span className={styles.submitArrow} aria-hidden="true">
                &rarr;
              </span>
            )}
          </button>

          <p className={styles.privacy}>
            By submitting this form, you agree that Fondue Flame may use the
            information provided to respond to your enquiry.
          </p>
        </div>
      </form>
    </div>
  );
}
