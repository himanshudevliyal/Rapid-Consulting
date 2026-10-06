"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StringArrayField from "@/components/string-array-field";
import { STATUS_OPTIONS } from "@/lib/service-form";
import { cn } from "@/lib/utils";
import HtmlField from "./html-field";
import SectionsEditor from "./sections-editor";

const selectClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

function Block({ title, description, children }) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

// Everything a visitor reads for one language version of a service.
export default function LocaleContent({ locale, control, register, errors }) {
  const p = `content.${locale}`;
  const e = errors?.content?.[locale] ?? {};

  return (
    <div className="space-y-5">
      <Block title="Page details" description="Title, headline and short text shown on the service page and in lists.">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${p}.title`}>Title *</Label>
            <Input id={`${p}.title`} className={cn({ "border-red-500": e.title })} {...register(`${p}.title`)} placeholder="Service name" />
            {e.title && <p className="text-sm text-red-500">{e.title.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${p}.h1`}>Page heading (H1)</Label>
            <Input id={`${p}.h1`} {...register(`${p}.h1`)} placeholder="Defaults to the title" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${p}.eyebrow`}>Eyebrow</Label>
            <Input id={`${p}.eyebrow`} {...register(`${p}.eyebrow`)} placeholder="Small label above the heading, e.g. Services" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${p}.status`}>Status</Label>
            <select id={`${p}.status`} className={selectClass} {...register(`${p}.status`)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${p}.review_label`}>Review label</Label>
            <Input id={`${p}.review_label`} className={cn({ "border-red-500": e.review_label })} {...register(`${p}.review_label`)} placeholder="e.g. Draft, Reviewed" />
            {e.review_label && <p className="text-sm text-red-500">{e.review_label.message}</p>}
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${p}.short_description`}>Short description</Label>
          <Textarea id={`${p}.short_description`} rows={3} {...register(`${p}.short_description`)} placeholder="One or two sentences shown on cards and in search results" />
        </div>
      </Block>

      <Block title="Introduction" description="The opening text under the heading.">
        <HtmlField control={control} name={`${p}.intro_html`} />
      </Block>

      <Block title="Page sections" description="The body of the page, in order. Each section chooses how it is laid out on the website.">
        <SectionsEditor control={control} register={register} name={`${p}.sections`} errors={e.sections} />
      </Block>

      <Block title="Sources" description="Reference links listed at the end of the page.">
        <StringArrayField control={control} name={`${p}.source_urls`} placeholder="https://…" addLabel="Add source" />
        {Array.isArray(e.source_urls) && e.source_urls.some(Boolean) && (
          <p className="text-sm text-red-500">One of the source links is not a full URL.</p>
        )}
      </Block>

      <Block title="Search engine (SEO)" description="Leave blank to use the title and short description.">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          <div className="space-y-1">
            <Label htmlFor={`${p}.meta_title`}>Meta title</Label>
            <Input id={`${p}.meta_title`} {...register(`${p}.meta_title`)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${p}.meta_keywords`}>Meta keywords</Label>
            <Input id={`${p}.meta_keywords`} {...register(`${p}.meta_keywords`)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${p}.og_image`}>Share image (URL or path)</Label>
            <Input id={`${p}.og_image`} {...register(`${p}.og_image`)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${p}.meta_description`}>Meta description</Label>
          <Textarea id={`${p}.meta_description`} rows={2} {...register(`${p}.meta_description`)} />
        </div>
      </Block>
    </div>
  );
}
