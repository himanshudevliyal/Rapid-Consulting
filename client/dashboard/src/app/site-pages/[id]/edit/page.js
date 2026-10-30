import SitePageEditPage from "@/features/site-pages/components/site-page-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <SitePageEditPage id={id} />;
}
