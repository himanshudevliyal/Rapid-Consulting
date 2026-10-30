"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/components/loader";
import FileUploaderServer from "@/components/file-uploader-server";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdviser, useCreateAdviser, useUpdateAdviser } from "@/hooks/use-advisers";
import { buildPayload, emptyAdviser, toFormValues } from "@/lib/adviser-form";
import { slugify } from "@/lib/service-form";
import { cn } from "@/lib/utils";
import { TEAM_GROUPS, adviserFormSchema } from "@/schemas/adviser";

const LIST_URL = "/advisers?page=1&limit=10";

export default function AdviserForm({ id, type = "create" }) {
  const isEdit = type === "edit";
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(adviserFormSchema),
    defaultValues: emptyAdviser,
  });

  const done = (message) => () => {
    toast.success(message);
    router.replace(LIST_URL);
  };
  const createMutation = useCreateAdviser(done("Adviser created"));
  const updateMutation = useUpdateAdviser(id, done("Adviser updated"));
  const { data, isLoading, isError, error } = useAdviser(id);

  // Load the saved adviser into the form (edit only).
  useEffect(() => {
    if (isEdit && data) reset(toFormValues(data));
  }, [isEdit, data?.id, data?.updated_at, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // On a new person, suggest the slug while the name is typed, until the
  // slug is edited by hand.
  const nameField = register("name");
  const suggestSlug = (event) => {
    nameField.onChange(event);
    if (!isEdit && !dirtyFields.slug) {
      setValue("slug", slugify(event.target.value), { shouldValidate: false });
    }
  };

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
            <Card title="Person" description="Shown as a card on the About page of the website.">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    className={cn({ "border-red-500": errors.name })}
                    {...nameField}
                    onChange={suggestSlug}
                    placeholder="Atul Goyal"
                  />
                  <FieldError error={errors.name} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slug">Slug (page address)</Label>
                  <Input
                    id="slug"
                    className={cn("font-mono text-sm", { "border-red-500": errors.slug })}
                    {...register("slug")}
                    placeholder="made-from-the-name"
                  />
                  <FieldError error={errors.slug} />
                  <p className="text-xs text-muted-foreground">
                    {isEdit
                      ? "Changing it changes the public link of this person's page."
                      : "Filled in from the name; leave it as it is or edit it."}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" {...register("designation")} placeholder="Founder, Rapid Consulting" />
                  <FieldError error={errors.designation} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="team_group">Group</Label>
                  <Input id="team_group" list="team-groups" {...register("team_group")} placeholder="Leadership" />
                  <datalist id="team-groups">
                    {TEAM_GROUPS.map((group) => (
                      <option key={group} value={group} />
                    ))}
                  </datalist>
                  <FieldError error={errors.team_group} />
                  <p className="text-xs text-muted-foreground">
                    The heading the person is listed under. Pick one or type your own.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="linkedin_url">LinkedIn link</Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    className={cn({ "border-red-500": errors.linkedin_url })}
                    {...register("linkedin_url")}
                    placeholder="https://www.linkedin.com/in/..."
                  />
                  <FieldError error={errors.linkedin_url} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio">Short bio</Label>
                <Textarea id="bio" rows={5} {...register("bio")} placeholder="A few lines about the person" />
                <FieldError error={errors.bio} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="expertise">Expertise</Label>
                <Textarea
                  id="expertise"
                  rows={5}
                  {...register("expertise")}
                  placeholder={"One area per line, e.g.\nIndustrial incentives\nMSME registrations"}
                />
                <FieldError error={errors.expertise} />
                <p className="text-xs text-muted-foreground">One item per line. Shown as a list on the person's page.</p>
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
                  <span className="block text-xs text-muted-foreground">Unticked people stay hidden on the website.</span>
                </span>
              </label>
              <div className="flex items-start gap-3 text-sm">
                <Controller
                  control={control}
                  name="is_placeholder"
                  render={({ field }) => (
                    <Switch
                      id="is_placeholder"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  )}
                />
                <Label htmlFor="is_placeholder" className="block cursor-pointer font-normal">
                  Placeholder card
                  <span className="block text-xs text-muted-foreground">
                    A "Team member" slot kept so the About page layout shows. Turn off once a real person is added.
                  </span>
                </Label>
              </div>
              <div className="space-y-1">
                <Label htmlFor="display_order">Display order</Label>
                <Input id="display_order" type="number" min={0} {...register("display_order")} placeholder="0" />
                <FieldError error={errors.display_order} />
                <p className="text-xs text-muted-foreground">Smaller numbers come first (within their group).</p>
              </div>
            </Card>

            <Card title="Photo" description="Shown on the person's card. A portrait works best.">
              <Controller
                control={control}
                name="photo"
                render={({ field }) => (
                  <FileUploaderServer value={field.value} onFileChange={(path) => field.onChange(path ?? "")} />
                )}
              />
              <FieldError error={errors.photo} />
            </Card>
          </>
        }
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="outline" asChild>
          <Link href={LIST_URL}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 animate-spin" />} {isEdit ? "Save changes" : "Add person"}
        </Button>
      </div>
    </form>
  );
}
