import { z } from "zod";
import { parsePhoneNumberWithError } from "libphonenumber-js";

export const baseUserSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      })
      .trim()
      .toLowerCase(),
    email: z.email("Please enter a valid email address"),
    mobile_number: z
      .string({ required_error: "Mobile number is required." })
      .min(1, { message: "Mobile number is required." }),
    fullname: z.string().min(1, { message: "Full name is required." }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters"),
  })
  .refine((data) => parsePhoneNumberWithError(data.mobile_number), {
    path: ["mobile_number"],
    message: "Invalid phone number",
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export const adminRoleSchema = baseUserSchema.and(
  z.object({ role: z.enum(["super_admin", "admin"]) }),
);

export const memberRoles = ["user"];

export const memberRoleSchema = (currRole) =>
  baseUserSchema
    .and(
      z.object({
        role: z.enum(memberRoles),
        organization_id: z
          .uuid({ message: "Select a valid Organization." })
          .nullable()
          .optional(),
      }),
    )
    .superRefine((data, ctx) => {
      if (
        ["super_admin", "admin"].includes(currRole) &&
        !data.organization_id
      ) {
        ctx.addIssue({
          code: z.custom,
          path: ["organization_id"],
          message: "Organization ID is required.",
        });
      }
    });

export const userCreateSchema = z.union([adminRoleSchema, memberRoleSchema]);

export const registerVerifySchema = baseUserSchema.and(
  z.object({
    request_id: z.uuid(),
    otp: z
      .string()
      .min(6, "OTP must be 6 digits")
      .max(6, "OTP must be 6 digits"),
  }),
);
