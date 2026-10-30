import { HomeHero } from "@/home/home-hero";
import { HomeSections } from "@/home/home-sections";
import { homeText } from "@/lib/pages/home-copy";
import { homeOverlay } from "@/home/managed-home";
import { overlayText } from "@/lib/content/managed-text";

/**
 * The home page (Option A): the hero, then the sections in the order of the
 * Figma prototype (see HomeSections). The hero is its own component
 * (@/home/home-hero): Option B's hero can replace `HomeHero` here without
 * touching the sections. The Round-1 carousel hero is no longer part of the
 * sequence.
 */
export function HomeView({ page, t, has, managed = null }) {
  // The managed page "home" (admin panel -> Pages) supplies the text; a field it
  // leaves empty keeps the built-in wording.
  const text = managed ? overlayText(homeText(t, has, page.locale), homeOverlay(managed.get)) : homeText(t, has, page.locale);

  return (
    <>
      {(!managed || managed.byKey.hero) && <HomeHero text={text} page={page} />}
      <HomeSections page={page} t={t} has={has} text={text} managed={managed} />
    </>
  );
}
