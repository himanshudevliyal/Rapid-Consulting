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
    router.push("/services");
  });

  const onSubmit = (data) => {
    // Wrap into API shape: service fields + en translation
    const payload = {
      code: data.code,
      slug: data.slug || undefined,
      type: data.type,
      family_code: data.family_code || null,
      icon: data.icon || undefined,
      sort_order: data.sort_order,
      is_active: data.is_active,
      translations: [
        {
          locale: "en",
          title: data.title,
          short_description: data.short_description || undefined,
          status: data.status,
        },
      ],
    };
    createMutation.mutate(payload);
  };

  return (
    <PageContainer
      pageTitle="Create Service"
      pageDescription="Add a new service"
      scrollable
    >
      <div className="max-w-2xl">
        <ServiceForm
          onSubmit={onSubmit}
          loading={createMutation.isPending}
        />
      </div>
    </PageContainer>
  );
}
