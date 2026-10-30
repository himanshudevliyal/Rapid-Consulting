import { CommunityInvite } from "@/components/common/community-invite";
import { AdvisersPage } from "@/app/[locale]/advisers/_components/AdvisersPage";

// The "For CAs, Bankers & Other Advisers" page (U01) when it is reached through the
// generic content template (page-view.jsx). It renders exactly what the /advisers
// route renders - one implementation, one look - with the same community invitations.
// `cases` is accepted for compatibility with older callers; the page links to the
// case studies from its own "see the work" section.
export function AdviserPage({ page, breadcrumbs, t, has }) {
  return (
    <>
      {breadcrumbs}
      <AdvisersPage
        page={page}
        t={t}
        has={has}
        community={<CommunityInvite placement="advisers" layout="full" locale={page.locale} />}
      />
    </>
  );
}
