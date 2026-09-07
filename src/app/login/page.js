import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-primary" />
          <span className="text-base font-semibold">Lead Portal</span>
        </div>
        <h1 className="text-lg font-semibold">Sign in to your account</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          Use the credentials provided by your administrator.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
