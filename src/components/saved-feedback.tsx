"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
export function SavedFeedback() {
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const saved = params?.get("saved");
    if (!saved) return;
    toast.success(
      saved === "created" ? "Banner criado com sucesso." : "Alterações salvas.",
    );
    router.replace("/gestao-7k2q/banners", { scroll: false });
  }, [params, router]);
  return null;
}
