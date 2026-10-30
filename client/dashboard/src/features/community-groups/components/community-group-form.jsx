"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/components/loader";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCommunityGroup,
  useCreateCommunityGroup,
  useUpdateCommunityGroup,
} from "@/hooks/use-community-groups";
import { buildPayload, emptyCommunityGroup, toFormValues } from "@/lib/community-group-form";
import { cn } from "@/lib/utils";
import { PLACEMENTS, communityGroupFormSchema } from "@/schemas/community-group";

const LIST_URL = "/community-groups?page=1&limit=10";

export default function CommunityGroupForm({ id, type = "create" }) {
  const isEdit = type === "edit";
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(communityGroupFormSchema),
    defaultValues: emptyCommunityGroup,
  });

  const done = (message) => () => {
    toast.success(message);
    router.replace(LIST_URL);
  };
  const createMutation = useCreateCommunityGroup(done("Group created"));
  const updateMutation = useUpdateCommunityGroup(id, done("Group updated"));
  const { data, isLoading, isError, error } = useCommunityGroup(id);

  // Load the saved group into the form (edit only).
  useEffect(() => {
    if (isEdit && data) reset(toFormValues(data));
  }, [isEdit, data?.id, data?.updated_at, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (values) => {
    const payload = buildPayload(values);
    if (isEdit) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };
  const invalid = () => toast.error("Please fix the highlighted fields");

  if (isEdit && isLoading) return <Loader />;
  if (isEdit && isError) return <ErrorMessage error={error} />;

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(submit, invalid)} className="space-y-6">
      <FormColumns
        main={
          <>
            <Card title="Group" description="A community visitors can join to receive updates.">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    className={cn({ "border-red-500": errors.name })}
                    {...register("name")}
                    placeholder="Industrial incentives updates"
                  />
                  <FieldError error={errors.name} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="audience">Who it is for</Label>
                  <Input id="audience" {...register("audience")} placeholder="e.g. Manufacturers and MSME owners" />
                  <FieldError error={errors.audience} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cadence">How often</Label>
                  <Input id="cadence" {...register("cadence")} placeholder="e.g. Monthly" />
                  <FieldError error={errors.cadence} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="join_url">Join link</Label>
                  <Input
                    id="join_url"
                    type="url"
                    className={cn({ "border-red-500": errors.join_url })}
                    {...register("join_url")}
                    placeholder="https://..."
                  />
                  <FieldError error={errors.join_url} />
                  <p className="text-xs text-muted-foreground">Optional. Leave empty until the group is ready to join.</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="updates">What members receive</Label>
                <Textarea
                  id="updates"
                  rows={5}
                  {...register("updates")}
                  placeholder={"One item per line, e.g.\nNew scheme announcements\nDeadline reminders"}
                />
                <FieldError error={errors.updates} />
                <p className="text-xs text-muted-foreground">One item per line. Shown as a bullet list.</p>
              </div>
            </Card>
          </>
        }
        side={
          <>
            <Card title="Status">
              <label htmlFor="is_active" className="flex items-start gap-2 text-sm">
                <input id="is_active" type="checkbox" className="mt-0.5 h-4 w-4" {...register("is_active")} />
                <span>
                  Active
                  <span className="block text-xs text-muted-foreground">Unticked groups stay hidden on the website.</span>
                </span>
              </label>
              <div className="space-y-1">
                <Label htmlFor="sort_order">Display order</Label>
                <Input id="sort_order" type="number" min={0} {...register("sort_order")} placeholder="0" />
                <FieldError error={errors.sort_order} />
                <p className="text-xs text-muted-foreground">Smaller numbers come first.</p>
              </div>
            </Card>

            <Card title="Shown on" description="The website pages where this group appears. None = not shown anywhere.">
              <Controller
                control={control}
                name="placements"
                render={({ field }) => (
                  <div className="space-y-2">
                    {PLACEMENTS.map((placement) => {
                      const checked = (field.value ?? []).includes(placement.value);
                      return (
                        <label
                          key={placement.value}
                          htmlFor={`placement-${placement.value}`}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            id={`placement-${placement.value}`}
                            type="checkbox"
                            className="h-4 w-4"
                            checked={checked}
                            onChange={(event) => {
                              const current = field.value ?? [];
                              field.onChange(
                                event.target.checked
                                  ? [...current, placement.value]
                                  : current.filter((value) => value !== placement.value),
                              );
                            }}
                          />
                          {placement.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              <FieldError error={errors.placements} />
            </Card>
          </>
        }
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="outline" asChild>
          <Link href={LIST_URL}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 animate-spin" />} {isEdit ? "Save changes" : "Create group"}
        </Button>
      </div>
    </form>
  );
}
