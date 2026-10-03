"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, RefreshCcw } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const isDevelopment = process.env.NODE_ENV === "development";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <h1 className="text-6xl font-bold">500</h1>
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {isDevelopment
            ? (error?.message ?? "An unexpected error occurred")
            : "An unexpected error has occurred. Please try again later."}
        </p>
        {/* Show stack trace only in development */}
        {/* {isDevelopment && error?.stack && (
          <pre className="bg-destructive/10 text-destructive max-w-96 overflow-auto rounded-lg p-4 text-left text-xs">
            {error.stack}
          </pre>
        )} */}
        <div className="flex flex-col justify-center gap-4 pt-6 sm:flex-row">
          <Button onClick={() => reset()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
