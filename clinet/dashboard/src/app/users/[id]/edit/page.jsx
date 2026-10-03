import UserEditPage from "@/features/users/components/user-edit-page";

export default async function EditPage({ params }) {
  const { id } = await params;
  return <UserEditPage id={id} />;
}
