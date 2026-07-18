"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthModeShell } from "@/features/auth/ui/AuthModeShell";

function LoginPageInner() {
  const params = useSearchParams();
  const nextParam = params.get("next");
  const nextPath = nextParam ?? undefined;

  return <AuthModeShell initialMode="login" nextPath={nextPath} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
