import React from "react";
import Image from "next/image";

export default function AuthLayout({ children, className }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="grid h-full w-full md:grid-cols-2">
        <div className="bg-background border-border hidden h-full border-r md:flex md:items-center md:justify-center">
          <figure>
            <Image
              src="/login.svg"
              alt="Authentication illustration"
              width={500}
              height={500}
              className="dark:brightness-90 dark:contrast-110"
            />
          </figure>
        </div>
        <div className="bg-background flex h-full items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
