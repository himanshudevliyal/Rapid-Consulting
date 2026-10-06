"use client";
import PageContainer from "@/components/layout/page-container";
import Loader from "@/components/loader";
import ErrorMessage from "@/components/ui/error";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import OptionForm from "./option-form";
import { getOptionConfig } from "./option-config";

export default function OptionEditPage({ kind, id }) {
  const config = getOptionConfig(kind);
  const router = useRouter();
  const { data, isLoading, isError, error } = config.hooks.useOne(id);
  const updateMutation = config.hooks.useUpdate(id, () => {
    toast.success(`${config.singular} updated successfully`);
    router.push(`${config.basePath}?page=1&limit=10`);
  });

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  const record = data?.data;
  return (
    <PageContainer pageTitle={`Edit ${config.singular}`} pageDescription={config.description} scrollable>
      <div className="max-w-2xl space-y-4">
        {record?.service_count > 0 && (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {record.service_count} service{record.service_count === 1 ? "" : "s"} use this {config.singular}.
          </p>
        )}
        <OptionForm config={config} initialData={record} onSubmit={(payload) => updateMutation.mutate(payload)} loading={updateMutation.isPending} />
      </div>
    </PageContainer>
  );
}
