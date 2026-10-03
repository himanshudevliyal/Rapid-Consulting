import React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ErrorMessage({ error, isTitle = true }) {
  return (
    <Alert variant="destructive" className={!isTitle && "py-2"}>
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle className={cn({ "sr-only": !isTitle })}>Error</AlertTitle>
      <AlertDescription>
        {error?.response?.data?.message ??
          error?.message ??
          "Something went wrong!"}
        {/* <pre>{JSON.stringify(error?.message, null, 2)}</pre> */}
      </AlertDescription>
    </Alert>
  );
}
