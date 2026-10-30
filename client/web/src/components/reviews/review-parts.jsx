import { Factory, FileText, MapPin, Star } from "lucide-react";

// The client review card and rating box shared by every reviews section: the
// service page ("reviews" role), the Home page and the managed site pages
// (About, Case studies, Subsidies, Finance and insurance, Buying land …).
// Server-safe (no hooks), so it renders inside the carousel from either side.

// "4.8" -> 4.8, clamped to 0..5; anything else (empty, "X.X") -> fallback.
export const starsOf = (value, fallback = 5) => {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(5, number)) : fallback;
};

// A design placeholder such as X.X, XX or XXXXX is not a real figure.
export const isRealFigure = (value) => {
  const text = String(value ?? "").trim();
  return Boolean(text) && !/^[X.\s]+$/i.test(text);
};

// "Change of Land Use (CLU), Fire NOC" or an array -> ["Change of Land Use (CLU)", "Fire NOC"].
export const serviceList = (value) =>
  (Array.isArray(value) ? value : String(value ?? "").split(/[,\n]/)).map((service) => String(service).trim()).filter(Boolean);

// Every quote reads “like this”, whether or not the editor typed the marks.
const quoted = (text) => {
  const value = String(text ?? "").trim();
  return /^["“‘']/.test(value) ? value : `“${value}”`;
};

export function Stars({ value, className = "size-3.5" }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={`${className} text-[#1f5d2c]`}
          // A star is filled once the rating reaches it (half a star or more rounds up).
          fill={value >= step - 0.5 ? "currentColor" : "none"}
          strokeWidth={1.75}
        />
      ))}
    </span>
  );
}

// Green rating box: "Overall rating 4.8 / 5 ★★★★★ 120 client reviews Source: Google".
// Shown only for a real rating; the count and source lines only when filled in.
export function RatingBox({ label, value, outOf = "5", countText, sourceText }) {
  if (!isRealFigure(value)) return null;
  return (
    <div className="flex w-fit items-center gap-4 rounded-xl bg-[#dff3d8] px-4 py-3 text-[#163f22]">
      <div>
        <p className="!m-0 text-[11px] font-semibold">{label}</p>
        <p className="!m-0 mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-bold leading-none tracking-tight">{String(value).trim()}</span>
          <span className="text-xs">/ {outOf}</span>
        </p>
      </div>
      <div className="text-[11px] leading-5">
        <Stars value={starsOf(value)} />
        {countText && <p className="!m-0 font-semibold">{countText}</p>}
        {sourceText && <p className="!m-0 opacity-80">{sourceText}</p>}
      </div>
    </div>
  );
}

// One review: quote mark, stars + trust line, the quote, the reviewer, and the
// services taken. Empty reviewer fields are left out.
export function ReviewCard({ quote, rating, name, business, location, services, trustLabel, servicesLabel, placeholder = false }) {
  const stars = starsOf(rating);
  const taken = serviceList(services);
  return (
    <figure
      data-placeholder={placeholder ? "true" : undefined}
      className="relative m-0 flex h-full min-h-[380px] flex-col overflow-hidden rounded-xl border border-slate-200 border-l-[6px] border-l-[#09263e] bg-white shadow-sm"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/review-quote.png" alt="" aria-hidden="true" width="254" height="160" className="block !h-11 !w-auto !max-w-none" />
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[#9fd18e] bg-[#e5f6df] px-2 py-0.5 text-xs font-bold text-[#163f22]">
              <span className="sr-only">Rated</span>
              {Number.isInteger(stars) ? stars : stars.toFixed(1)}
              <Stars value={stars} className="size-3" />
              <span className="sr-only">out of 5</span>
            </span>
            {trustLabel && <span className="max-w-[9rem] text-[9px] font-bold uppercase leading-tight tracking-[0.08em] text-slate-600">{trustLabel}</span>}
          </div>
        </div>
        <blockquote className="m-0 mt-4 text-[17px] font-semibold leading-snug text-[#09263e]">{quoted(quote)}</blockquote>
        <figcaption className="mt-auto pt-5">
          <hr className="m-0 mb-3 border-0 border-t-2 border-[#c4552d]" />
          {name && <p className="!m-0 text-[15px] font-bold text-[#09263e]">{name}</p>}
          {business && <p className="!m-0 mt-0.5 text-sm text-slate-600">{business}</p>}
          {location && (
            <p className="!m-0 mt-1.5 flex items-center gap-1 text-xs text-slate-600">
              <MapPin className="size-3.5 shrink-0 text-[#c4552d]" aria-hidden="true" />
              {location}
            </p>
          )}
        </figcaption>
      </div>
      {taken.length > 0 && (
        <div className="relative border-t border-slate-200 bg-[#eef1f4] px-5 py-3">
          <Factory className="pointer-events-none absolute bottom-2 right-3 size-9 text-slate-400/30" aria-hidden="true" />
          <p className="!m-0 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
            <FileText className="size-3.5" aria-hidden="true" />
            {servicesLabel}
          </p>
          <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0 pr-10">
            {taken.map((service) => (
              <li key={service} className="m-0 rounded-md border border-[#e3a48b] bg-white px-2 py-0.5 text-[11px] font-medium text-[#a33b14]">
                {service}
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
}
