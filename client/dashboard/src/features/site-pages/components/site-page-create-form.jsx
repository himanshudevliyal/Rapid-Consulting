"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import Loader from "@/components/loader";
import { FieldError, FormCard as Card } from "@/components/form-layout";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSitePage, useSitePageRegistry } from "@/hooks/use-site-pages";
import { handleSuccessToast } from "@/lib/handle-success-toast";
import { LOCALES, TEMPLATE_KEYS, recordOf, slugifyText } from "@/lib/site-page";
import { cn } from "@/lib/utils";
import { sitePageCreateSchema } from "@/schemas/site-page";

const LIST_URL = "/site-pages?page=1&limit=10";

// New page: template, language, address and title. The sections are built in
// the editor that opens next.
export default function SitePageCreateForm() {
  const router = useRouter();
  const registry = useSitePageRegistry();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(sitePageCreateSchema),
    defaultValues: { template: "", locale: "en", path: "", title: "" },
  });

  const createMutation = useCreateSitePage((data) => {
    const created = recordOf(data);
    handleSuccessToast({ message: "Page created as a draft. Add its sections next." });
    router.replace(created?.id ? `/site-pages/${created.id}/edit` : LIST_URL);
  });

  // Suggest the path while the title is typed, until the path is edited by hand.
  const titleField = register("title");
  const suggestPath = (event) => {
    titleField.onChange(event);
    if (!dirtyFields.path) setValue("path", slugifyText(event.target.value), { shouldValidate: false });
  };

  if (registry.isLoading) return <Loader />;
  if (registry.isError) return <ErrorMessage error={registry.error} />;

  const templates = registry.data?.templates ?? {};
  const templateKeys = Object.keys(templates).length ? Object.keys(templates) : TEMPLATE_KEYS;
  const selectedTemplate = watch("template");
  const locale = watch("locale");

  return (
    <form onSubmit={handleSubmit((values) => createMutation.mutate(values))} className="max-w-4xl space-y-6">
      <Card title="Template" description="The starting structure. It decides which sections can be added.">
        <Controller
          control={control}
          name="template"
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {templateKeys.map((key) => {
                const item = templates[key] ?? {};
                const active = field.value === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => field.onChange(key)}
                    aria-pressed={active}
                    className={cn("rounded-lg border p-3 text-left transition-colors hover:bg-accent", {
                      "border-primary bg-accent ring-2 ring-primary/30": active,
                    })}
                  >
                    <span className="block text-sm font-medium">{item.label ?? key}</span>
                    {item.description && <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>}
                    {item.layout && (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {item.layout === "rail" ? "Content with a sticky enquiry column" : "Full width"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        />
        <FieldError error={errors.template} />
      </Card>

      <Card title="Language and address" description="Each language is its own page with its own sections. Create the other language afterwards from the editor.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="locale">Language *</Label>
            <select id="locale" className="h-9 w-full rounded-md border bg-transparent px-3 text-sm" {...register("locale")}>
              {LOCALES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <FieldError error={errors.locale} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...titleField} onChange={suggestPath} placeholder="Page title" />
            <FieldError error={errors.title} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="path">Path *</Label>
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm text-muted-foreground">/{locale}/</span>
              <Input id="path" className="font-mono text-sm" {...register("path")} placeholder="your-project/setting-up" />
            </div>
            <FieldError error={errors.path} />
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers and hyphens, with / between parts, no leading slash. It must be unique for the language, and
              cannot start with a word the website already uses (services, schemes, articles, about, contact and so on).
            </p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" asChild>
          <Link href={LIST_URL}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={createMutation.isPending || !selectedTemplate}>
          {createMutation.isPending && <Loader2 className="mr-2 animate-spin" />} Create page
        </Button>
      </div>
    </form>
  );
}
