"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "@/components/loader";
import TextEditor from "@/components/editor";
import CustomMultiSelect from "@/components/custom-multi-select";
import FileUploaderServer from "@/components/file-uploader-server";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateIndustry,
  useIndustry,
  useSchemeOptions,
  useServiceOptions,
  useUpdateIndustry,
} from "@/hooks/use-industries";
import { buildPayload, emptyIndustry, toFormValues } from "@/lib/industry-form";
import { slugify } from "@/lib/service-form";
import { cn } from "@/lib/utils";
import { industryFormSchema } from "@/schemas/industry";

const LIST_URL = "/industries?page=1&limit=10";

export default function IndustryForm({ id, type = "create" }) {
  const isEdit = type === "edit";
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(industryFormSchema),
    defaultValues: emptyIndustry,
  });

  const done = (message) => () => {
    toast.success(message);
    router.replace(LIST_URL);
  };
  const createMutation = useCreateIndustry(done("Industry created"));
  const updateMutation = useUpdateIndustry(id, done("Industry updated"));
  const { data, isLoading, isError, error } = useIndustry(id);
  const services = useServiceOptions();
  const schemes = useSchemeOptions();
  const optionsReady = !services.isLoading && !schemes.isLoading;

  // Load the saved industry into the form (edit only), once the names of the
  // linked services and schemes are known.
  useEffect(() => {
    if (isEdit && data && optionsReady) {
      reset(toFormValues(data, { services: services.data ?? [], schemes: schemes.data ?? [] }));
    }
  }, [isEdit, data?.id, data?.updated_at, optionsReady, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // On a new industry, suggest the slug while the name is typed, until the
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

  const metaTitleLength = (watch("meta_title") ?? "").length;
  const metaDescriptionLength = (watch("meta_description") ?? "").length;

  if (isEdit && (isLoading || !optionsReady)) return <Loader />;
  if (isEdit && isError) return <ErrorMessage error={error} />;

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(submit, invalid)} className="space-y-6">
      <FormColumns
        main={
          <>
            <Card title="Basics" description="The name and the public address of the industry page.">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    className={cn({ "border-red-500": errors.name })}
                    {...nameField}
                    onChange={suggestSlug}
                    placeholder="Food and Agro Processing"
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
                      ? "Changing it changes the public link of this page."
                      : "Filled in from the name; leave it as it is or edit it."}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="h1">Page heading</Label>
                <Input id="h1" {...register("h1")} placeholder="Shown as the main heading; the name is used if empty" />
                <FieldError error={errors.h1} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Short description</Label>
                <Textarea id="description" rows={3} {...register("description")} placeholder="One or two sentences shown on industry cards and menus" />
                <FieldError error={errors.description} />
              </div>
            </Card>

            <Card title="Page content" description="The text of the industry page.">
              <div className="space-y-1">
                <Label>Introduction</Label>
                <Controller
                  control={control}
                  name="intro"
                  render={({ field }) => <TextEditor value={field.value ?? ""} onChange={field.onChange} />}
                />
              </div>
              <div className="space-y-1">
                <Label>Main content</Label>
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => <TextEditor value={field.value ?? ""} onChange={field.onChange} />}
                />
                <p className="text-xs text-muted-foreground">Use Heading 2 for each section; they become the sections of the page.</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="note">Note</Label>
                <Textarea id="note" rows={3} {...register("note")} placeholder="Optional note shown under the related services and schemes" />
                <FieldError error={errors.note} />
              </div>
            </Card>

            <Card title="Related services and schemes" description="Shown as cards on the industry page, in the order chosen.">
              <div className="space-y-1">
                <Label>Services</Label>
                <Controller
                  control={control}
                  name="service_slugs"
                  render={({ field }) => (
                    <CustomMultiSelect
                      async
                      value={field.value}
                      onChange={field.onChange}
                      options={services.data ?? []}
                      isLoading={services.isLoading}
                      isError={services.isError}
                      error={services.error}
                      placeholder="Select services"
                    />
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label>Schemes</Label>
                <Controller
                  control={control}
                  name="scheme_slugs"
                  render={({ field }) => (
                    <CustomMultiSelect
                      async
                      value={field.value}
                      onChange={field.onChange}
                      options={schemes.data ?? []}
                      isLoading={schemes.isLoading}
                      isError={schemes.isError}
                      error={schemes.error}
                      placeholder="Select schemes"
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">Only published schemes are shown on the website.</p>
              </div>
            </Card>

            <Card title="Search engines" description="Optional. If left empty, the website uses the heading and description.">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="meta_title">Meta title</Label>
                  <Input id="meta_title" {...register("meta_title")} placeholder="Shown as the title in search results" />
                  <p className="text-xs text-muted-foreground">{metaTitleLength} characters (about 60 works best)</p>
                  <FieldError error={errors.meta_title} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="meta_description">Meta description</Label>
                  <Textarea id="meta_description" rows={3} {...register("meta_description")} placeholder="Shown under the title in search results" />
                  <p className="text-xs text-muted-foreground">{metaDescriptionLength} characters (about 155 works best)</p>
                  <FieldError error={errors.meta_description} />
                </div>
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
                  <span className="block text-xs text-muted-foreground">Unticked industries stay hidden on the website.</span>
                </span>
              </label>
              <div className="space-y-1">
                <Label htmlFor="display_order">Display order</Label>
                <Input id="display_order" type="number" min={0} {...register("display_order")} placeholder="0" />
                <FieldError error={errors.display_order} />
                <p className="text-xs text-muted-foreground">Smaller numbers come first.</p>
              </div>
            </Card>

            <Card title="Image" description="Shown on industry cards and at the top of the page.">
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <FileUploaderServer value={field.value} onFileChange={(path) => field.onChange(path ?? "")} />
                )}
              />
              <FieldError error={errors.image} />
            </Card>

            <Card title="Icon">
              <Input id="icon" {...register("icon")} placeholder="Icon name or URL (optional)" />
            </Card>
          </>
        }
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="outline" asChild>
          <Link href={LIST_URL}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 animate-spin" />} {isEdit ? "Save changes" : "Create industry"}
        </Button>
      </div>
    </form>
  );
}
