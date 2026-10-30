/**
 * The "95% success rate" proof seal (Home hero): the gold seal artwork
 * (public/assets/brand/success-seal-gold.png), or with variant="ribbon" the red
 * ribbon (success-ribbon.png). It is a different component from the FREE FIRST
 * REVIEW form seal: use it only where an approved page shows it, together with
 * its footnote.
 *
 * The figure and the words are in the image; `value` and `label` (or
 * `ariaLabel`) become its text alternative, so the meaning stays accessible.
 *
 *   <ProofSeal value="95%" label="Success rate" ariaLabel="95% success rate" />
 *   <ProofSeal value="95%" label="Success rate" variant="ribbon" />
 */
const ARTWORK = {
  seal: { src: "/assets/brand/success-seal-gold.png", width: 1368, height: 1149, size: "w-[100px] sm:w-[108px]" },
  ribbon: { src: "/assets/brand/success-ribbon.png", width: 1254, height: 1254, size: "w-[96px] sm:w-[104px]" },
};

export function ProofSeal({ value, label, ariaLabel, variant = "seal", className = "" }) {
  const art = ARTWORK[variant] ?? ARTWORK.seal;
  const text = ariaLabel || [value, label].filter(Boolean).join(" ");
  return (
    <div data-component="ProofSeal" data-variant={variant} className={`shrink-0 ${art.size} ${className}`}>
      <img
        src={art.src}
        width={art.width}
        height={art.height}
        alt={text}
        decoding="async"
        className="block h-auto w-full select-none drop-shadow-md"
      />
    </div>
  );
}

export default ProofSeal;
