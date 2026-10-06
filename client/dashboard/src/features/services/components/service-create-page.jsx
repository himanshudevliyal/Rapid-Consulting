"use client";
import PageContainer from "@/components/layout/page-container";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateService } from "@/hooks/use-services";
import ServiceForm from "./service-form";

export default function ServiceCreatePage() {
  const router = useRouter();

  const createMutation = useCreateService(() => {
    toast.success("Service created successfully");
    router.push("/services?page=1&limit=10");
  });

  return (
    <PageContainer
      pageTitle="Create Service"
      pageDescription="Add a new service page. Only the Format and English title are required; add the rest now or later."
      scrollable
    >
      <div className="max-w-5xl">
        <ServiceForm onSubmit={(payload) => createMutation.mutate(payload)} loading={createMutation.isPending} />
      </div>
    </PageContainer>
  );
}
