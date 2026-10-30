// The heading block of a page section: a small rust label above the H2. The
// label is the section's short menu name (or its number when that adds nothing).
export function SectionHeading({ id, eyebrow, title, onDark = false, className = "" }) {
  return (
    <div className={`b2b-sec__head ${className}`}>
      {eyebrow && <p className={`b2b-eyebrow ${onDark ? "b2b-eyebrow--on-navy" : ""}`}>{eyebrow}</p>}
      <h2 id={id} className={`b2b-h2 ${onDark ? "b2b-h2--on-navy" : ""}`}>
        {title}
      </h2>
    </div>
  );
}
