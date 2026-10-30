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
import FileUploaderServer from "@/components/file-uploader-server";
import { FieldError, FormCard as Card, FormColumns } from "@/components/form-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSession, useSession, useUpdateSession } from "@/hooks/use-sessions";
import { slugify } from "@/lib/service-form";
import { buildPayload, emptySession, toFormValues } from "@/lib/session-form";
import { cn } from "@/lib/utils";
import { SESSION_STATES, sessionFormSchema } from "@/schemas/session";

const LIST_URL = "/sessions?page=1&limit=10";

export default function SessionForm({ id, type = "create" }) {
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
    resolver: zodResolver(sessionFormSchema),
    defaultValues: emptySession,
  });

  const done = (message) => () => {
    toast.success(message);
    router.replace(LIST_URL);
  };
  const createMutation = useCreateSession(done("Session created"));
  const updateMutation = useUpdateSession(id, done("Session updated"));
  const { data, isLoading, isError, error } = useSession(id);

  // Load the saved session into the form (edit only).
  useEffect(() => {
    if (isEdit && data) reset(toFormValues(data));
  }, [isEdit, data?.id, data?.updated_at, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // On a new session, suggest the slug while the title is typed, until the
  // slug is edited by hand.
  const titleField = register("title");
  const suggestSlug = (event) => {
    titleField.onChange(event);
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
  const state = isEdit ? SESSION_STATES[data?.state] : null;

  return (
    <form onSubmit={handleSubmit(submit, invalid)} className="space-y-6">
      <FormColumns
        main={
          <>
            <Card title="Basics" description="The session and the public address of its page (/sessions/<slug>).">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    className={cn({ "border-red-500": errors.title })}
                    {...titleField}
                    onChange={suggestSlug}
                    placeholder="Session title"
                  />
                  <FieldError error={errors.title} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slug">Slug (page address)</Label>
                  <Input
                    id="slug"
                    className={cn("font-mono text-sm", { "border-red-500": errors.slug })}
                    {...register("slug")}
                    placeholder="made-from-the-title"
                  />
                  <FieldError error={errors.slug} />
                  <p className="text-xs text-muted-foreground">
                    {isEdit
                      ? "Changing it changes the public link of this session."
                      : "Filled in from the title; leave it as it is or edit it."}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" {...register("topic")} placeholder="e.g. Industrial incentives" />
                  <FieldError error={errors.topic} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="audience">Who it is for</Label>
                  <Input id="audience" {...register("audience")} placeholder="e.g. MSME owners and finance heads" />
                  <FieldError error={errors.audience} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="speaker_name">Speaker</Label>
                  <Input id="speaker_name" {...register("speaker_name")} placeholder="Speaker name" />
                  <FieldError error={errors.speaker_name} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="speaker_title">Speaker title</Label>
                  <Input id="speaker_title" {...register("speaker_title")} placeholder="e.g. Director, Rapid Consulting" />
                  <FieldError error={errors.speaker_title} />
                </div>
              </div>
            </Card>

            <Card title="Summary" description="What the session covers. Shown on the session page.">
              <Controller
                control={control}
                name="summary"
                render={({ field }) => <TextEditor value={field.value ?? ""} onChange={field.onChange} />}
              />
              <FieldError error={errors.summary} />
            </Card>

            <Card title="Schedule & registration" description="When it happens and where people sign up.">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
                <div className="space-y-1">
                  <Label htmlFor="starts_at">Starts at</Label>
                  <Input
                    id="starts_at"
                    type="datetime-local"
                    className={cn({ "border-red-500": errors.starts_at })}
                    {...register("starts_at")}
                  />
                  <FieldError error={errors.starts_at} />
                  <p className="text-xs text-muted-foreground">Your local time.</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min={1}
                    className={cn({ "border-red-500": errors.duration_minutes })}
                    {...register("duration_minutes")}
                    placeholder="60"
                  />
                  <FieldError error={errors.duration_minutes} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="registration_url">Registration link</Label>
                <Input
                  id="registration_url"
                  type="url"
                  className={cn({ "border-red-500": errors.registration_url })}
                  {...register("registration_url")}
                  placeholder="https://..."
                />
                <FieldError error={errors.registration_url} />
              </div>
              <label htmlFor="registration_open" className="flex items-start gap-2 text-sm">
                <input id="registration_open" type="checkbox" className="mt-0.5 h-4 w-4" {...register("registration_open")} />
                <span>
                  Registration open
                  <span className="block text-xs text-muted-foreground">
                    Untick to close registration. A session with a recording link shows as Recording.
                  </span>
                </span>
              </label>
              <div className="space-y-1">
                <Label htmlFor="recording_url">Recording link</Label>
                <Input
                  id="recording_url"
                  type="url"
                  className={cn({ "border-red-500": errors.recording_url })}
                  {...register("recording_url")}
                  placeholder="https://... (add after the session)"
                />
                <FieldError error={errors.recording_url} />
              </div>
            </Card>

            <Card title="Related resources" description="Links shown under the session.">
              <div className="space-y-1">
                <Textarea
                  id="related_resources"
                  rows={4}
                  className={cn("font-mono text-sm", { "border-red-500": errors.related_resources })}
                  {...register("related_resources")}
                  placeholder={"Scheme guide | https://example.com/guide\nChecklist | https://example.com/checklist"}
                />
                <FieldError error={errors.related_resources} />
                <p className="text-xs text-muted-foreground">One per line, as: Title | https://link</p>
              </div>
            </Card>
          </>
        }
        side={
          <>
            <Card title="Status">
              {state && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Shown on the website as</span>
                  <Badge variant={state.variant}>{state.label}</Badge>
                </div>
              )}
              <label htmlFor="is_active" className="flex items-start gap-2 text-sm">
                <input id="is_active" type="checkbox" className="mt-0.5 h-4 w-4" {...register("is_active")} />
                <span>
                  Active
                  <span className="block text-xs text-muted-foreground">Unticked sessions stay hidden on the website.</span>
                </span>
              </label>
              <div className="space-y-1">
                <Label htmlFor="sort_order">Display order</Label>
                <Input id="sort_order" type="number" min={0} {...register("sort_order")} placeholder="0" />
                <FieldError error={errors.sort_order} />
                <p className="text-xs text-muted-foreground">Smaller numbers come first.</p>
              </div>
            </Card>

            <Card title="Cover image" description="Shown on cards and at the top of the page.">
              <Controller
                control={control}
                name="cover_image"
                render={({ field }) => (
                  <FileUploaderServer value={field.value} onFileChange={(path) => field.onChange(path ?? "")} />
                )}
              />
              <FieldError error={errors.cover_image} />
            </Card>
          </>
        }
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <Button type="button" variant="outline" asChild>
          <Link href={LIST_URL}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 animate-spin" />} {isEdit ? "Save changes" : "Create session"}
        </Button>
      </div>
    </form>
  );
}
