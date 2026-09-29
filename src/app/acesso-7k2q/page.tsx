import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/login-form";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { hasAdminAuthEnv } from "@/lib/env";
import "./login.css";

export const metadata: Metadata = {
  title: "Acesse o painel | Xingyu",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await hasValidAdminSession()) redirect("/gestao-7k2q");
  const configured = hasAdminAuthEnv();
  return (
    <main className="login-page">
      <section className="login-card">
        <BrandMark compact />
        <h1>Painel Link Bio</h1>
        <p>Digite a senha para continuar.</p>
        {!configured && process.env.NODE_ENV === "development" && (
          <div className="setup-note">
            Configure ADMIN_PASSWORD_HASH e ADMIN_SESSION_SECRET para habilitar
            o acesso.
          </div>
        )}
        <Suspense fallback={<div className="helper">Carregando...</div>}>
          <LoginForm configured={configured} />
        </Suspense>
      </section>
    </main>
  );
}
