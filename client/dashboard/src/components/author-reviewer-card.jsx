"use client";
import { Controller } from "react-hook-form";
import CommandMenu from "@/components/command-menu";
import { FieldError, FormCard as Card } from "@/components/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdviserOptions } from "@/hooks/use-advisers";
import { REVIEW_STATUSES } from "@/lib/author-fields";

// Author, Reviewer and "Reviewed on" for articles, schemes and case studies.
// The form needs the fields author_id, reviewer_id, reviewed_at and
// review_status (see authorFields in lib/author-fields.js). The date is
// disabled until a reviewer is chosen and is cleared when the reviewer is
// cleared.
export default function AuthorReviewerCard({ control, register, setValue, watch, errors }) {
  const advisers = useAdviserOptions();
  const reviewerId = watch("reviewer_id");

  return (
    <Card
      title="Author & reviewer"
      description="Optional. People from the Advisers list, shown as the byline on the website."
    >
      <div className="space-y-1">
        <Label>Author</Label>
        <Controller
          control={control}
          name="author_id"
          render={({ field }) => (
            <CommandMenu
              data={advisers.options}
              value={field.value || null}
              onChange={(val) => field.onChange(val ?? "")}
              searchPlaceholder="Search advisers"
              emptyMessage="No advisers found."
              isLoading={advisers.isLoading}
              isError={advisers.isError}
              error={advisers.error}
            />
          )}
        />
        <FieldError error={errors?.author_id} />
      </div>

      <div className="space-y-1">
        <Label>Reviewer</Label>
        <Controller
          control={control}
          name="reviewer_id"
          render={({ field }) => (
            <CommandMenu
              data={advisers.options}
              value={field.value || null}
              onChange={(val) => {
                field.onChange(val ?? "");
                if (!val) setValue("reviewed_at", "", { shouldDirty: true });
              }}
              searchPlaceholder="Search advisers"
              emptyMessage="No advisers found."
              isLoading={advisers.isLoading}
              isError={advisers.isError}
              error={advisers.error}
            />
          )}
        />
        <FieldError error={errors?.reviewer_id} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="reviewed_at">Reviewed on</Label>
        <Input id="reviewed_at" type="date" disabled={!reviewerId} {...register("reviewed_at")} />
        <FieldError error={errors?.reviewed_at} />
        <p className="text-xs text-muted-foreground">Choose a reviewer first. Leave empty if no date applies.</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="review_status">Review status</Label>
        <select
          id="review_status"
          className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
          {...register("review_status")}
        >
          {REVIEW_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <FieldError error={errors?.review_status} />
        <p className="text-xs text-muted-foreground">
          Public credit (&quot;Reviewed by&quot;) appears only when the status is Completed.
        </p>
      </div>
    </Card>
  );
}
