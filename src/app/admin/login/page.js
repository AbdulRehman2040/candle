import { Suspense } from "react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: "Sign in | Fondue Flame Admin" };

export default function LoginPage() {
  /* LoginForm reads ?next= via useSearchParams, which needs a Suspense
     boundary for the page to prerender. */
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
