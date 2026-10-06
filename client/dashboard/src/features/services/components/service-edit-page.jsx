"use client";
import PageContainer from "@/components/layout/page-container";
import Loader from "@/components/loader";
import ErrorMessage from "@/components/ui/error";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useService, useUpdateService } from "@/hooks/use-services";
import ServiceForm from "./service-form";

export default function ServiceEditPage({ id }) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useService(id);

  const updateMutation = useUpdateService(id, () => {
    toast.success("Service updated successfully");
    router.push("/services?page=1&limit=10");
  });

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;
  if (!data) return <ErrorMessage error={new Error("Service not found")} />;

  return (
    <PageContainer
      pageTitle="Edit Service"
      pageDescription={`${data.translations?.find((t) => t.locale === "en")?.title ?? "This service"} · all the content of this service is shown below`}
      scrollable
    >
      <div className="max-w-5xl">
        <ServiceForm initialData={data} onSubmit={(payload) => updateMutation.mutate(payload)} loading={updateMutation.isPending} />
      </div>
    </PageContainer>
  );
}
