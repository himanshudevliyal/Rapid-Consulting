import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

// ✏️ Optional: har case ki photo (public/ ke andar). Khaali ho to green gradient + pattern dikhega.
const CASE_IMAGES = [
   "/assets/hero-section.jpg",
   "/assets/hero-section.jpg",
   "/assets/hero-section.jpg",
];

const strip = (s = "") =>
  s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

const AMOUNT = /₹\s?[\d,.]+(?:\s?(?:lakh|crore|cr|million|लाख|करोड़))?/i;

// html paragraph se amount + short description nikalta hai
function readCopy(html = "") {
  const text = strip(html);
  const amount = text.match(AMOUNT)?.[0]?.replace(/\s+/g, " ");
  return { amount, text };
}

export function CaseCard({
  item,
  html,
  index = 0,
  label = "Case Study",
  amountLabel = "Approximately",
  cta = "Read the case",
}) {
  const { text } = readCopy(html);

  const image = item.image || CASE_IMAGES[index];

  const amount = item.metric || readCopy(html).amount;

  const from = text.search(/Approximately|लगभग/);

  const desc = (from >= 0
    ? text.slice(from)
    : text.replace(item.title || "", "")
  )
    .replace(AMOUNT, "")

    .replace(/\s+([.,])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();



  return (
    <Link
      href={item.href}
      className="group   text-white!  relative isolate flex min-h-[460px] flex-col overflow-hidden rounded-[1.75rem] bg-[#1f5d57] p-4 shadow-[0_18px_40px_-20px_rgba(9,38,62,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-20px_rgba(9,38,62,0.55)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#eaff6b]"
    >
      {/* background photo / pattern */}
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,rgba(234,255,107,0.25),transparent_45%),radial-gradient(circle_at_90%_60%,rgba(255,255,255,0.12),transparent_40%)]"
        />
      )}
      {/* green overlay: halka upar, gehra neeche */}
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0d3b37]/20 via-[#1f5d57]/45 to-[#0d3b37]/95" />

      {/* glass panel */}
      <div className="rounded-3xl border border-white/30 bg-white/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-md backdrop-saturate-150">
        <span className="mb-2.5 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] !text-white!/80">{label}</span>
        <h3 className="!text-lg italic font-semibold !leading-snug text-white! sm:!text-xl">{item.title}</h3>
        <span aria-hidden="true" className="mt-3.5 block h-0.5 w-12 rounded-full bg-[#eaff6b]" />

        {amount && (
          <div className="mt-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] !text-white!/85">
              <span className="size-1.5 rounded-full bg-[#eaff6b]" aria-hidden="true" />
              {amountLabel}
            </p>
            <p className="mt-1 !text-3xl font-bold tracking-tight !text-[#eaff6b]">{amount}</p>
          </div>
        )}
      </div>

      {/* description */}
      {desc && <p className="mt-auto  px-2.5 pb-3.5 pt-5 !text-[13.5px] !leading-6 !text-white!/85">{desc}</p>}

      {/* CTA */}

      <div  className=" h-full  justify-center text-center w-full flex items-end text-end">
      <span
        className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#eaff6b] text-sm font-semibold text-[#09263e] transition-colors group-hover:bg-white ${desc ? "" : "mt-auto"}`}
      >
        {cta}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </span>
      </div>
    </Link>
  );
}