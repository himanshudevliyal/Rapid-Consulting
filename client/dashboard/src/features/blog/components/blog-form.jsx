"use client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import ErrorMessage from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/loader";
import { useBlog, useCreateBlog, useUpdateBlog } from "@/hooks/use-blogs";
import { useFormattedCategories } from "@/hooks/use-categories";
import { blogSchema } from "@/schemas/blog-schema";
import { Loader2, XIcon } from "lucide-react";
import FileUpload from "@/components/file-uploader";
import { toast } from "sonner";
import Image from "next/image";
import config from "@/config";
import CommandMenu from "@/components/command-menu";
import FieldError from "@/components/ui/field-error";
import TextEditor from "@/components/editor";

export default function BlogForm({ id, type = "create" }) {
  const [files, setFiles] = useState({ pictures: [] });
  const [fileUrls, setFileUrls] = useState({ picture_urls: [] });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setError,
  } = useForm({ resolver: zodResolver(blogSchema) });

  const router = useRouter();
  const handleSuccess = () => {
    reset();
    router.replace("/blogs?page=1&limit=10");
  };

  const createMutation = useCreateBlog(handleSuccess);
  const updateMutation = useUpdateBlog(id, handleSuccess);
  const { data, isLoading, isError, error } = useBlog(id);
  const {
    data: categories,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    error: categoryError,
  } = useFormattedCategories("");

  const onSubmit = (data) => {
    if (!fileUrls?.picture_urls?.length && !files.pictures.length) {
      toast.warning("Pictures required");
      return setError("pictures", {
        type: "manual",
        message: "Atleast 1 picture is required*",
      });
    }

    const formData = new FormData();
    Object.entries(files).forEach(([key, value]) => {
      value?.forEach((file) => formData.append(key, file));
    });

    Object.entries(data).forEach(([key, value]) => {
      typeof value === "object"
        ? formData.append(key, JSON.stringify(value))
        : formData.append(key, value ?? "");
    });

    if (type === "edit") {
      Object.entries(fileUrls).forEach(([key, values]) => {
        formData.append(key, JSON.stringify(values));
      });
    }

    type === "create"
      ? createMutation.mutate(formData)
      : updateMutation.mutate(formData);
  };

  const handlePictureChange = useCallback((data) => {
    setFiles((prev) => ({ ...prev, pictures: data }));
  }, []);

  useEffect(() => {
    if (!data) return;

    setFileUrls((prev) => ({ ...prev, picture_urls: data?.pictures ?? [] }));
    reset({
      title: data.title,
      category_id: data.category_id ?? "",
      description: data.description,
      content: data.content,
      date: data.date ? data.date.split("T")[0] : "",
      meta_title: data.meta_title,
      meta_keywords: data.meta_keywords,
      meta_description: data.meta_description,
    });
  }, [data, setFileUrls]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;
  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2">
        {/* images */}
        <div className="col-span-full space-y-4">
          <Label>Pictures</Label>
          <FileUpload
            onFileChange={handlePictureChange}
            inputName={"picture"}
            className={cn({ "border-red-500": errors.pictures })}
            initialFiles={[]}
            multiple={true}
            maxFiles={50}
          />

          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
            {fileUrls.picture_urls?.map((src, index) => (
              <div
                className="bg-accent relative aspect-square w-24 rounded-md"
                key={index}
              >
                <Image
                  src={`${config.file_base}/${src}`}
                  width={200}
                  height={200}
                  className="size-full rounded-[inherit] object-cover"
                  alt={`picture-${index}`}
                  unoptimized
                />
                <Button
                  onClick={() =>
                    setFileUrls((prev) => ({
                      ...prev,
                      picture_urls: prev.picture_urls.filter((i) => i !== src),
                    }))
                  }
                  size="icon"
                  className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                  aria-label="Remove image"
                  type="button"
                >
                  <XIcon className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            className={cn({ "border-red-500": errors.title })}
            {...register("title", { required: "Title is required" })}
            placeholder="Enter title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Category (optional)</Label>
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <CommandMenu
                data={categories ?? []}
                labelKey={"Category"}
                searchPlaceholder="Search category"
                onChange={field.onChange}
                value={field.value}
                isLoading={isCategoryLoading}
                isError={isCategoryError}
                error={categoryError}
              />
            )}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          {...register("description")}
          placeholder="Short summary shown on blog cards/listings"
        />
      </div>

      <div className="space-y-1">
        <Label>Content</Label>
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <TextEditor value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="meta_title">Meta Title</Label>
        <Input
          id="meta_title"
          type="text"
          placeholder="Enter meta title"
          {...register("meta_title")}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="meta_description">Meta Description</Label>
        <Textarea
          id="meta_description"
          rows={3}
          {...register("meta_description")}
          placeholder="Enter meta description"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="meta_keywords">Meta Keywords</Label>
        <Input
          id="meta_keywords"
          type="text"
          placeholder="keyword1, keyword2, keyword3"
          {...register("meta_keywords")}
        />
      </div>

      <div className="text-end">
        <Button type="submit" disabled={isFormPending}>
          {isFormPending && <Loader2 className="animate-spin" />} Submit
        </Button>
      </div>
    </form>
  );
}