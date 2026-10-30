"use client";
import React from "react";
import { SidebarHeader, useSidebar } from "./ui/sidebar";
import Image from "next/image";

// The logo is dark on a transparent background: in the dark theme it is drawn
// white (brightness-0 + invert), in the light theme as it is.
const LOGO_THEME = "dark:brightness-0 dark:invert";

export default function SideHeader() {
  const { state } = useSidebar();

  return (
    <SidebarHeader className={""}>
      <div className="flex pl-2">
        {state === "collapsed" ? (
          <Image
            src="/logo-icon.png"
            width={50}
            height={50}
            alt="Rapid Consulting"
            className={`shrink-0 mx-auto ${LOGO_THEME}`}
          />
        ) : (
          <Image
            src="/logo.png"
            width={130}
            height={130}
            alt="Rapid Consulting"
            className={`shrink-0 rounded-sm ${LOGO_THEME}`}
          />
        )}
      </div>
    </SidebarHeader>
  );
}
