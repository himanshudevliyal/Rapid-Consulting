import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductVariant } from "@/hooks/use-product-variants";
import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function ProductVariantForm({ type = "create", id }) {
  const {
    control,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const { data } = useProductVariant(id);

  useEffect(() => {
    if (data) {
      console.log({ data });
    }
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="w-full">
          <Input
            type="file"
            onChange={(e) => setValue(`pictures`, e.target.files)}
            multiple
          />
        </div>
        <div className="flex items-start gap-2 rounded-md">
          <Input
            type="number"
            placeholder="Pack Size"
            {...register(`pack_size`, {
              valueAsNumber: true,
            })}
            className={cn({
              "border-red-500": errors?.variants?.[index]?.pack_size,
            })}
          />

          <Input
            type="number"
            placeholder="Price"
            {...register(`price`, {
              valueAsNumber: true,
            })}
            className={cn({
              "border-red-500": errors?.variants?.[index]?.price,
            })}
          />

          <Input
            type="number"
            placeholder="Display Price"
            {...register(`display_price`, {
              valueAsNumber: true,
            })}
          />

          <Input
            placeholder="SKU"
            {...register(`sku`)}
            className={cn({
              "border-red-500": errors?.variants?.[index]?.sku,
            })}
          />

          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
