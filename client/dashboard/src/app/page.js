import LoginForm from "@/components/forms/login";
import AuthLayout from "@/components/layout/auth-layout";

export default function Home() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
