import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Called by the dashboard after it changes stockists or the Coming soon
   switch, so the public Where to Buy page updates on the next visit
   instead of waiting for its 60-second cache to run out. Signed-in
   admins only. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/stockists");
  return Response.json({ ok: true });
}
