import UserForm from "@/features/users/components/user-form";
import PageContainer from "@/components/layout/page-container";

export default function UserCreatePage({ role }) {
  return (
    <PageContainer
      pageTitle={"User create"}
      pageDescription="Create user."
      className="mx-auto max-w-3xl"
    >
      <UserForm type={"create"} role={role} />
    </PageContainer>
  );
}
