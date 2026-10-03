// Phosphor line icons shipped in /public/assets/icons (brand guide).
export function Icon({ name = "arrow-right", className = "" }) {
  return (
    <span className={`icon ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/assets/icons/${name}.svg`} alt="" width="28" height="28" />
    </span>
  );
}
