import { Button } from "@/components/ui/button";
import FieldError from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, Trash } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

export default function ProductDeliveryInfo() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "delivery_info",
  });

  return (
    <div className="space-y-3">
      {fields.map((_, ind) => (
        <div key={ind} className="rounded-md  flex items-start gap-1">
          <div className="space-y-1 w-full">
            <Input
              {...register(`delivery_info.${ind}.info`)}
              placeholder="Enter info"
              className={cn("w-full", {
                "border-destructive!": errors?.delivery_info?.[ind]?.info,
              })}
            />
            {errors?.delivery_info?.[ind]?.info && (
              <FieldError
                message={errors?.delivery_info?.[ind]?.info?.message}
              />
            )}
          </div>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => remove(ind)}
            disabled={fields.length === 1}
            className={"grow-0"}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append({ info: "" })}
      >
        <Plus className="h-4 w-4" />
        Add info
      </Button>
    </div>
  );
}
