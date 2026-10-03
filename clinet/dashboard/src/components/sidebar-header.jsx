"use client";
import React, { useEffect, useState } from "react";
import { SidebarHeader, useSidebar } from "./ui/sidebar";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function SideHeader() {
  const { state } = useSidebar();
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return;

  return (
    <SidebarHeader className={""}>
      <div className="flex pl-2">
        {state === "collapsed" ? (
          <Image
            src={theme === "light" ? "/logo-icon.png" : "/logo-icon.png"}
            width={50}
            height={50}
            alt="Radhayu herbals"
            className="shrink-0 mx-auto"
          />
        ) : (
          <Image
            src={theme === "light" ? "/logo.png" : "/logo.png"}
            width={130}
            height={130}
            alt="Radhayu herbals"
            className="shrink-0  rounded-sm"
          />
        )}
      </div>
    </SidebarHeader>
  );
}
