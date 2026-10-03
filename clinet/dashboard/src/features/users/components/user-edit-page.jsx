import UserForm from "@/features/users/components/user-form";
import PageContainer from "@/components/layout/page-container";

export default async function UserEditPage({ id, role = null }) {
  return (
    <PageContainer
      pageTitle="Edit User"
      pageDescription="Edit user."
      className="mx-auto max-w-3xl"
    >
      <UserForm id={id} type="edit" role={role} />
    </PageContainer>
  );
}
