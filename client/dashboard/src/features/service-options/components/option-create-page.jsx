"use client";
import PageContainer from "@/components/layout/page-container";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import OptionForm from "./option-form";
import { getOptionConfig } from "./option-config";

export default function OptionCreatePage({ kind }) {
  const config = getOptionConfig(kind);
  const router = useRouter();
  const createMutation = config.hooks.useCreate(() => {
    toast.success(`${config.singular} created successfully`);
    router.push(`${config.basePath}?page=1&limit=10`);
  });

  return (
    <PageContainer pageTitle={`Create ${config.singular}`} pageDescription={config.description} scrollable>
      <div className="max-w-2xl">
        <OptionForm config={config} onSubmit={(data) => createMutation.mutate(data)} loading={createMutation.isPending} />
      </div>
    </PageContainer>
  );
}
