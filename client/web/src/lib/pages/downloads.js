import fs from "node:fs";
import path from "node:path";

import { idForPath } from "@/lib/page-routes";

const SEGMENTS = { scheme: "schemes", guide: "guides", article: "articles" };

// The ungated PDF of a scheme, guide or article ("/downloads/D001.pdf"), or
// null when none was prepared for it. Server only. The PDFs are filed under
// the page's content identity; `page.pdfUrl` (when a record carries its own)
// wins.
export function pdfFor(page) {
  if (page.pdfUrl) return page.pdfUrl;
  const segment = SEGMENTS[page.type];
  if (!segment) return null;
  // API records are found by address; written pages carry the identity itself.
  const id = page.slug ? idForPath(`/${segment}/${page.slug}`) : /^[A-Z]+\d+$/.test(page.id ?? "") ? page.id : null;
  if (!id) return null;
  const file = `${id}.pdf`;
  try {
    return fs.existsSync(path.join(process.cwd(), "public", "downloads", file)) ? `/downloads/${file}` : null;
  } catch {
    return null;
  }
}
