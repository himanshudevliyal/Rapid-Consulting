import SessionEditPage from "@/features/sessions/components/session-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <SessionEditPage id={id} />;
}
