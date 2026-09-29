import type { Metadata } from "next";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-auth";
import { hasDatabaseEnv, isAdminPreviewMode } from "@/lib/env";
import "./admin.css";

export const metadata: Metadata = {
  title: "Painel | Xingyu",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();
  const previewMode = isAdminPreviewMode() && !hasDatabaseEnv();
  return (
    <AdminShell
      accessLabel={previewMode ? "Dados de demonstração" : "Acesso interno"}
      previewMode={previewMode}
    >
      {children}
    </AdminShell>
  );
}
