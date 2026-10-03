"use client";

import { useId } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Marquee } from "../ui/marquee";
import Section from "../layout/section";
import Heading from "../layout/heading";

export const clientLogos = [
  {
    id: "boi",
    name: "Bank of India",
    src: "/assets/logo/boi.png",
  },
  {
    id: "kotak",
    name: "Kotak Mahindra Bank",
    src: "/assets/logo/kotak.png",
  },
  {
    id: "hdfc",
    name: "HDFC Bank",
    src: "/assets/logo/hdfc.png",
  },
  {
    id: "axis",
    name: "Axis Bank",
    src: "/assets/logo/axis.png",
  },
  {
    id: "pnb",
    name: "Punjab National Bank",
    src: "/assets/logo/pnb.png",
  },
  {
    id: "anida",
    name: "Anida",
    src: "/assets/logo/anida.png",
  },
  {
    id: "darcl",
    name: "DARCL",
    src: "/assets/logo/darcl.png",
  },
  {
    id: "logo-3",
    name: "Client",
    src: "/assets/logo/logo-3.png",
  },
  {
    id: "novice",
    name: "Novice",
    src: "/assets/logo/novice.png",
  },
  {
    id: "velmoc",
    name: "Velmoc",
    src: "/assets/logo/velmoc.png",
  },
];

export function ClientTicker() {
  const t = useTranslations();
  const uid = useId();

  const placeholders = clientLogos.length === 0;

  const logos = placeholders
    ? Array.from({ length: 8 }, (_, i) => ({
        id: `placeholder-${i}`,
        name: t("clients.logo", {
          number: i + 1,
        }),
        src: "",
      }))
    : clientLogos;

  return (
    <Section
      id={uid}
      containerClassName="
        overflow-hidden
        rounded-[28px]
        bg-[#e8efec]
        px-6
        py-16
        sm:rounded-[32px]
        sm:px-10
        sm:py-20
        lg:px-16
        lg:py-24
      "
    >
      <Heading
        heading={t("clients.title")}
        subheading={
          placeholders
            ? t("clients.placeholderNote")
            : t("clients.note")
        }
        headingClassName="
          text-4xl
          tracking-[-0.045em]
          text-[#092947]
          sm:text-5xl
          lg:text-[64px]
          lg:leading-[1.08]
        "
        subheadingClassName="
          mx-auto
          mt-6
          text-base
          leading-7
          text-[#617384]
          sm:text-lg
          sm:leading-8
        "
      />

      <div className="relative mt-16 w-full sm:mt-20">
        <div
          className="
            pointer-events-none
            absolute
            left-0
            top-0
            z-10
            h-full
            w-16
            bg-gradient-to-r
            from-[#e8efec]
            to-transparent
            sm:w-28
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            z-10
            h-full
            w-16
            bg-gradient-to-l
            from-[#e8efec]
            to-transparent
            sm:w-28
          "
        />

        <Marquee pauseOnHover className="w-full">
          {logos.map((logo) => (
            <div
              key={logo.id}
              className="
                mx-8
                flex
                h-[90px]
                w-[200px]
                shrink-0
                items-center
                justify-center
                rounded-md
                bg-white
                px-5
              "
            >
              {logo.src ? (
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={180}
                  height={70}
                  loading="lazy"
                  className="
                    object-contain
                    transition-opacity
                    duration-300
                    hover:opacity-80
                  "
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "180px",
                    maxHeight: "70px",
                  }}
                />
              ) : (
                <span className="text-sm font-medium text-slate-400">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
        </Marquee>
      </div>
    </Section>
  );
}