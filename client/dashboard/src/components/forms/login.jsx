"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AtSign, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { handleError } from "@/lib/handle-error-toast";
import { handleSuccessToast } from "@/lib/handle-success-toast";
import { useState } from "react";
import FieldError from "../ui/field-error";

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // rememberMe: z.boolean().optional(),
});

// API login function
const loginUser = async (data) => {
  await axios.post("/api/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      handleSuccessToast("Login successful!");
      router.replace("/dashboard");
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate({ ...data, role: "admin" });
  };

  return (
    <div className="m-auto max-w-xs">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <AtSign className="text-muted-foreground absolute top-2.5 left-3 h-5 w-5" />
              <Input
                id="username"
                placeholder="johndoe"
                className="pl-10"
                {...register("username")}
              />
            </div>
            {errors.username && (
              <p className="text-destructive text-sm">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {/* <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link> */}
            </div>
            <div className="relative">
              <KeyRound className="text-muted-foreground absolute top-2.5 left-3 h-5 w-5" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <FieldError message={errors.password.message} />
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Sign in
          </Button>
        </form>
      </CardContent>
    </div>
  );
}
