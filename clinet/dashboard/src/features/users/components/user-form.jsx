"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userFormSchema, userUpdateSchema } from "@/schemas/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneSelect from "../../../components/ui/phone-input";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import Loader from "../../../components/loader";
import ErrorMessage from "../../../components/ui/error";
import { useRouter } from "next/navigation";
import { useCreateUser, useGetUser, useUpdateUser } from "@/hooks/use-users";
import { userRoles } from "@/data";
import FieldError from "../../../components/ui/field-error";
import CommandMenu from "@/components/command-menu";
import { useAuth } from "@/providers/auth-provider";

export default function UserForm({ id, type, role = null }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
    watch,
    unregister,
  } = useForm({
    resolver: zodResolver(
      type === "create"
        ? userFormSchema(user?.role)
        : userUpdateSchema(user?.role),
    ),
    defaultValues: {
      username: "",
      email: "",
      mobile_number: "",
      fullname: "",
      password: "",
      role: role,
    },
  });

  console.log({ errors });
  const selectedRole = watch("role");
  const createMutation = useCreateUser(() => {
    reset();
    router.replace("/users?page=1&limit=10");
  });
  const updateMutation = useUpdateUser(id, () => {
    router.back();
  });
  const { data, isLoading, isError, error } = useGetUser(id);

  const onSubmit = (data) => {
    type === "create"
      ? createMutation.mutate(data)
      : updateMutation.mutate(data);
  };

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  useEffect(() => {
    if (type === "edit" && data) {
      reset({
        email: data.email || "",
        fullname: data.fullname || "",
        mobile_number: data.mobile_number || "",
        role: data.role || "",
        username: data.username || "",
      });
    }
  }, [data, type, reset]);

  useEffect(() => {
    if (selectedRole !== "organization") {
      unregister("organization");
    }
  }, [selectedRole, unregister]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Role */}
        {!role && (
          <div className="">
            <Label htmlFor="role">Role *</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => {
                return (
                  <CommandMenu
                    data={userRoles}
                    onChange={field.onChange}
                    value={field.value}
                    className={cn("w-full", {
                      "border-destructive": errors.role,
                    })}
                    disabled={type === "edit"}
                  />
                );
              }}
            />
            <FieldError message={errors?.role?.message} />
          </div>
        )}

        {/* Username */}
        <div className="">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            placeholder="Enter your username"
            {...register("username")}
            className={cn({ "border-destructive": errors.username })}
          />
          <FieldError message={errors?.username?.message} />
        </div>

        {/* Password */}
        {type === "create" && (
          <div className="relative">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className={cn("pr-10", {
                  "border-destructive": errors.password,
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <FieldError message={errors?.password?.message} />
            </div>
          </div>
        )}
        {/* Confirm Password */}
        {type === "create" && (
          <div className="relative">
            <Label htmlFor="confirm_password">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                {...register("confirm_password")}
                className={cn("pr-10", {
                  "border-destructive pr-10": errors.confirm_password,
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <FieldError message={errors?.confirm_password?.message} />
            </div>
          </div>
        )}

        <div className="col-span-full grid gap-4 md:grid-cols-3">
          {/* full Name */}
          <div className="">
            <Label htmlFor="fullname">Fullname *</Label>
            <Input
              id="fullname"
              placeholder="Enter your name"
              {...register("fullname")}
              className={cn({ "border-destructive": errors.fullname })}
            />
            <FieldError message={errors?.fullname?.message} />
          </div>
          {/* Mobile Number */}
          <div className="">
            <Label htmlFor="mobile_number">Mobile Number *</Label>
            <Controller
              control={control}
              name="mobile_number"
              render={({ field }) => (
                <PhoneSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter your mobile number"
                  className={cn({
                    "border-destructive border": errors.mobile_number,
                  })}
                />
              )}
            />
            <FieldError message={errors?.mobile_number?.message} />
          </div>
          {/* Email */}
          <div className="">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email"
              {...register("email")}
              className={cn({ "border-destructive": errors.email })}
            />
            <FieldError message={errors?.email?.message} />
          </div>
        </div>

        {selectedRole === "organization" && (
          <div className="col-span-full mt-4 grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <div className="text-muted-foreground col-span-full text-sm font-semibold">
              Organization Details
            </div>

            {/* Organization Name */}
            <div className="">
              <Label>Organization Name *</Label>
              <Input
                placeholder="Enter organization name"
                {...register("organization.name")}
                className={cn({
                  "border-destructive": errors?.organization?.name,
                })}
              />
              <FieldError message={errors?.organization?.name?.message} />
            </div>

            {/* GSTIN */}
            <div className="">
              <Label>GSTIN *</Label>
              <Input
                placeholder="Enter GSTIN"
                {...register("organization.gstin")}
                className={cn({
                  "border-destructive": errors?.organization?.gstin,
                })}
              />
              <FieldError message={errors?.organization?.gstin?.message} />
            </div>

            {/* PAN */}
            <div className="">
              <Label>PAN *</Label>
              <Input
                placeholder="Enter PAN"
                {...register("organization.pan")}
                className={cn({
                  "border-destructive": errors?.organization?.pan,
                })}
              />
              <FieldError message={errors?.organization?.pan?.message} />
            </div>

            {/* Industry */}
            <div className="">
              <Label>Industry *</Label>
              <Input
                placeholder="Enter industry"
                {...register("organization.industry")}
                className={cn({
                  "border-destructive": errors?.organization?.industry,
                })}
              />
              <FieldError message={errors?.organization?.industry?.message} />
            </div>

            {/* Address */}
            <div className="col-span-full">
              <Label>Address *</Label>
              <Input
                placeholder="Enter address"
                {...register("organization.address")}
                className={cn({
                  "border-destructive": errors?.organization?.address,
                })}
              />
              <FieldError message={errors?.organization?.address?.message} />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="text-end">
        <Button
          type="submit"
          disabled={isFormPending || !isDirty}
          className={"w-full sm:w-auto"}
        >
          {isFormPending && (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          )}
          Submit
        </Button>
      </div>
    </form>
  );
}
