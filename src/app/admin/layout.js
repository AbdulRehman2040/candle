import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin | Fondue Flame" };

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
