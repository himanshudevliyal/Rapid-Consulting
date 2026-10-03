"use client";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import {
  useCreateInventory,
  useInventory,
  useUpdateInventory,
} from "@/hooks/use-inventories";
import Loader from "@/components/loader";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function StockInventoryForm({
  id,
  type = "create",
  callback,
  stockType,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { product_id: id, type: stockType } });

  const createMutation = useCreateInventory(callback);
  const updateMutation = useUpdateInventory(id, callback);
  const { data, isLoading, isError, error } = useInventory(id);

  const onSubmit = (data) => {
    type === "create"
      ? createMutation.mutate({ product_id: id, ...data })
      : updateMutation.mutate({ product_id: id, ...data });
  };

  useEffect(() => {
    if (data) {
      reset({ stock: data.stock });
    }
  }, [data, reset]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2">
        <div className="space-y-1">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            className={cn({
              "border-destructive!": errors.stock,
            })}
            {...register("stock", {
              required: "required*",
              valueAsNumber: true,
            })}
            placeholder="Enter stock"
          />
          {errors.stock && (
            <span className="text-sm text-destructive">
              {errors.stock.message}
            </span>
          )}
        </div>
      </div>

      <div className="text-end">
        <Button type="submit" disabled={isFormPending}>
          {isFormPending && <Loader2 className="animate-spin" />} Submit
        </Button>
      </div>
    </form>
  );
}
