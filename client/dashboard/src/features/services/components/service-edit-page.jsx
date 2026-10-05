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
    router.push("/services");
  });

  const onSubmit = (formData) => {
    const payload = {
      code: formData.code,
      slug: formData.slug || undefined,
      type: formData.type,
      family_code: formData.family_code || null,
      icon: formData.icon || undefined,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
      translations: [
        {
          locale: "en",
          title: formData.title,
          short_description: formData.short_description || undefined,
          status: formData.status,
        },
      ],
    };
    updateMutation.mutate(payload);
  };

  if (isLoading || !data) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  // translations array me se "en" locale nikalo
  const enTranslation = data?.translations?.find((t) => t.locale === "en") ?? {};

  const initialData = {
    ...data,
    title: enTranslation.title ?? enTranslation.h1 ?? "",
    short_description: enTranslation.short_description ?? "",
    status: enTranslation.status ?? "draft",
  };

  return (
    <PageContainer
      pageTitle="Edit Service"
      pageDescription="Update service details"
      scrollable
    >
      <div className="max-w-2xl">
        <ServiceForm
          initialData={initialData}
          onSubmit={onSubmit}
          loading={updateMutation.isPending}
        />
      </div>
    </PageContainer>
  );
}