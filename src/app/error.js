"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({ error, reset }) {
  // Never swallow Next.js control-flow errors (redirect / notFound). React error
  // boundaries catch everything, so we must re-throw these ourselves.
  if (typeof error?.digest === "string" && error.digest.startsWith("NEXT_")) {
    throw error;
  }

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-lg font-semibold">Something went wrong</p>
      <p className="max-w-md text-sm text-muted-foreground">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
