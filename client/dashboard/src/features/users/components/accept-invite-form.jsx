"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userInviteAcceptSchema } from "@/schemas/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneSelect from "../../../components/ui/phone-input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAcceptInvite } from "@/hooks/use-users";
import FieldError from "../../../components/ui/field-error";

export default function AcceptInviteForm({ token = "" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(userInviteAcceptSchema),
    defaultValues: {
      username: "",
      email: "",
      mobile_number: "",
      fullname: "",
      password: "",
      token: token,
    },
  });

  const createMutation = useAcceptInvite(() => {
    reset();
    router.replace("/");
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const isFormPending = createMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
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
          </div>
          <FieldError message={errors?.password?.message} />
        </div>

        {/* Confirm Password */}
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
          </div>
          <FieldError message={errors?.confirm_password?.message} />
        </div>

        {/* Mobile Number */}
        <div className="col-span-full">
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
        <div className="col-span-full">
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

      {errors?.token && <FieldError message={errors?.token?.message} />}

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
