import { EYEBROW, H2, LEAD } from "./styles";

/**
 * Eyebrow (rust small caps) + H2 + optional intro, left aligned.
 * `tone="dark"` is for navy panels.
 */
export function SectionHeading({ eyebrow, title, intro, id, className = "", tone = "light" }) {
  const dark = tone === "dark";
  return (
    <div className={className}>
      {eyebrow && <p className={`${EYEBROW} ${dark ? "text-[#eaff6b]!" : ""}`}>{eyebrow}</p>}
      <h2 id={id} className={`${H2} ${dark ? "text-white!" : ""}`}>
        {title}
      </h2>
      {intro && <p className={`${LEAD} ${dark ? "text-white/85!" : ""}`}>{intro}</p>}
    </div>
  );
}

export default SectionHeading;
