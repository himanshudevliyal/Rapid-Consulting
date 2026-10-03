"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircleIcon } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { useEffect } from "react";
import Loader from "@/components/loader";
import ErrorMessage from "@/components/ui/error";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { productFormSchema } from "@/schemas/product-schema";
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from "@/hooks/use-products";
import { useFormattedCategories } from "@/hooks/use-categories";
import { useFormattedSubCategories } from "@/hooks/use-sub-categories";
import CommandMenu from "@/components/command-menu";
import { useState } from "react";
import FieldError from "@/components/ui/field-error";
import ProductHeroForm from "./product-hero-form";
import ProductOverviewForm from "./product-overview-form";
import ProductDetailsForm from "./product-details-form";
import ProductMaterialsForm from "./product-materials-form";
import ProductSpecificationsForm from "./product-specifications-form";
import ProductFileListForm from "./product-file-list-form";
import ProductGalleryForm from "./product-gallery-form";
import TextEditor from "@/components/editor";
import StringArrayField from "@/components/string-array-field";
import FileUrlUploader from "@/components/file-url-uploader";

const defaultValues = {
  category_id: "",
  sub_category_id: "",
  title: "",
  thumbnail: "",
  short_description: "",
  colors: [],
  content: "",
  is_active: true,
  sort_order: 0,
  hero: { heading: "", subheading: "", descriptions: [], images: [] },
  overview: {
    heading: "",
    descriptions: [],
    image: "",
    features: { heading: "", list: [] },
  },
  details: { sections: [], banner: { image: "" } },
  materials: { sections: [] },
  specifications: [],
  models_3d: [],
  downloads: [],
  gallery: { heading: "", images: [] },
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
};

export default function ProductForm({ id, type, callback }) {
  const router = useRouter();
  const methods = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = methods;

  const createMutation = useCreateProduct(() => {
    reset();
    callback ? callback?.() : router.push("/products?page=1&limit=10");
  });
  const updateMutation = useUpdateProduct(id, () => {
    reset();
    callback ? callback?.() : router.back();
  });
  const { data, isLoading, isError, error } = useProduct(id);

  // Category (main table) and Subcategory (separate sub_categories table,
  // linked via category_id) are two distinct fields on the product now -
  // `category_id` + `sub_category_id`, not one self-referencing field.
  const [selectedCategory, setSelectedCategory] = useState("");

  const {
    data: categories,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    error: categoryError,
  } = useFormattedCategories("");

  // Subcategories belonging to whichever Category is currently selected
  const {
    data: subcategories,
    isLoading: isSubcategoryLoading,
    isError: isSubcategoryError,
    error: subcategoryError,
  } = useFormattedSubCategories(`category_id=${selectedCategory}`, {
    enabled: !!selectedCategory,
  });

  // Product create/update now sends plain JSON - images/files are already
  // uploaded (see FileUrlUploader / ImageArrayUploader) and referenced as
  // URL strings inside hero/gallery/materials/models_3d/downloads.
  const onSubmit = (data) => {
    type === "create"
      ? createMutation.mutate(data)
      : updateMutation.mutate(data);
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  useEffect(() => {
    if (type === "edit" && data) {
      setSelectedCategory(data.category_id || "");

      reset({
        ...defaultValues,
        ...data,
        hero: { ...defaultValues.hero, ...data.hero },
        overview: {
          ...defaultValues.overview,
          ...data.overview,
          features: {
            ...defaultValues.overview.features,
            ...data.overview?.features,
          },
        },
        details: {
          ...defaultValues.details,
          ...data.details,
          banner: { ...defaultValues.details.banner, ...data.details?.banner },
        },
        materials: { ...defaultValues.materials, ...data.materials },
        gallery: { ...defaultValues.gallery, ...data.gallery },
        specifications: data.specifications || [],
        models_3d: data.models_3d || [],
        downloads: data.downloads || [],
      });
    }
  }, [data]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-3 gap-4">
          {/* category (main) */}
          <div>
            <Label>Category *</Label>
            <CommandMenu
              data={categories ?? []}
              labelKey={"Category"}
              searchPlaceholder="Search category"
              onChange={(val) => {
                setSelectedCategory(val);
                methods.setValue("category_id", val, { shouldValidate: true });
                // Changing the main category invalidates any previously
                // picked subcategory (it belonged to the old category).
                methods.setValue("sub_category_id", "");
              }}
              value={selectedCategory}
              isLoading={isCategoryLoading}
              isError={isCategoryError}
              error={categoryError}
              className={cn({
                "border-destructive!": errors.category_id,
              })}
            />
            {errors?.category_id && (
              <FieldError message={errors?.category_id?.message} />
            )}
          </div>

          {/* subcategory (optional, from the separate sub_categories table) */}
          <div>
            <Label>Subcategory</Label>
            <Controller
              control={control}
              name="sub_category_id"
              render={({ field }) => (
                <CommandMenu
                  data={subcategories ?? []}
                  labelKey={"Subcategory"}
                  searchPlaceholder="Search subcategory"
                  disabled={!selectedCategory}
                  onChange={field.onChange}
                  value={field.value}
                  isLoading={isSubcategoryLoading}
                  isError={isSubcategoryError}
                  error={subcategoryError}
                />
              )}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Optional — pick a Category first to see its subcategories.
            </p>
          </div>

          {/* title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              className={cn({ "border-red-500": errors.title })}
              placeholder="Enter title"
            />
            {errors?.title && <FieldError message={errors?.title?.message} />}
          </div>

          {/* main image - used on product cards/listings */}
          <div>
            <Label>Main image</Label>
            <Controller
              control={control}
              name="thumbnail"
              render={({ field }) => (
                <FileUrlUploader
                  value={field.value}
                  onUploaded={field.onChange}
                  accept="image/*"
                  label="Upload main image"
                />
              )}
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Shown on product cards/listings.
            </p>
          </div>

          {/* sort order */}
          <div>
            <Label htmlFor="sort_order">Sort order</Label>
            <Input
              id="sort_order"
              type="number"
              {...register("sort_order", { valueAsNumber: true })}
            />
          </div>

          {/* short description */}
          <div className="col-span-full">
            <Label htmlFor="short_description">Short description</Label>
            <Textarea
              id="short_description"
              {...register("short_description")}
              placeholder="Enter short description"
            />
          </div>

          <div className="col-span-full flex items-center gap-2">
            <Controller
              control={control}
              name="is_active"
              render={({ field: { onChange, value } }) => (
                <Checkbox onCheckedChange={onChange} checked={value} />
              )}
            />
            <Label className="text-sm">Active</Label>
          </div>
        </div>

        <Separator className="col-span-full" />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Hero</h3>
          <ProductHeroForm />
        </div>

        <Separator className="col-span-full" />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Overview</h3>
          <ProductOverviewForm />
        </div>

        <Separator className="col-span-full" />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Details</h3>
          <ProductDetailsForm />
        </div>

        <Separator className="col-span-full" />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Materials</h3>
          <ProductMaterialsForm />
        </div>

        <Separator className="col-span-full" />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Specifications</h3>
          <ProductSpecificationsForm />
        </div>

        <Separator className="col-span-full" />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">3D Models</h3>
          <ProductFileListForm name="models_3d" addLabel="Add 3D model" />
        </div>

        <Separator className="col-span-full" />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Downloads</h3>
          <ProductFileListForm name="downloads" addLabel="Add download" />
        </div>

        <Separator className="col-span-full" />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Gallery</h3>
          <ProductGalleryForm />
        </div>

        <Separator className="col-span-full" />

        {/* colors - separate from specifications, multiple values */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Colors</h3>
          <StringArrayField
            control={control}
            name="colors"
            placeholder="e.g. Matte Black"
            addLabel="Add color"
          />
        </div>

        <Separator className="col-span-full" />

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">Content</h3>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <TextEditor value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <Separator className="col-span-full" />

        {/* seo */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold">SEO</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="meta_title">Meta title</Label>
              <Input
                id="meta_title"
                {...register("meta_title")}
                placeholder="Enter meta title"
              />
            </div>
            <div>
              <Label htmlFor="meta_description">Meta description</Label>
              <Textarea
                id="meta_description"
                {...register("meta_description")}
                placeholder="Enter meta description"
              />
            </div>
            <div>
              <Label htmlFor="meta_keywords">Meta keywords</Label>
              <Textarea
                id="meta_keywords"
                {...register("meta_keywords")}
                placeholder="Enter meta keywords"
              />
            </div>
          </div>
        </div>

        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="mb-2 font-medium">
                Please fix the following errors:
              </div>
              <ul className="list-inside list-disc space-y-1">
                {formErrors.map((err, i) => (
                  <li key={i} className="text-sm">
                    {err}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-end">
          <Button
            type="submit"
            disabled={isFormPending}
            className="w-full sm:w-auto"
          >
            {isFormPending && (
              <LoaderCircleIcon className="-ms-1 animate-spin" size={16} />
            )}
            Submit
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}