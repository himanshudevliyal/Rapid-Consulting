import { userRoles } from "@/data";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";
import { organizationSchema } from "./organization-schema";

/**
 * Ensure roles are always valid at runtime
 */
const roleValues = userRoles.map((r) => r.value);

if (!roleValues.length) {
  throw new Error("userRoles must contain at least one role");
}

/**
 * Base fields shared across user schemas
 */
const baseUserSchema = z.object({
  role: z.enum(roleValues, {
    required_error: "Role is required.",
  }),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    })
    .trim()
    .toLowerCase(),

  email: z.string().email("Please enter a valid email address"),

  mobile_number: z
    .string({ required_error: "Mobile number is required." })
    .min(1, "Mobile number is required."),

  fullname: z.string().min(1, "Full name is required."),
});

/**
 * Create User Schema
 */
export const userFormSchema = (currRole) =>
  baseUserSchema
    .extend({
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirm_password: z
        .string()
        .min(8, "Confirm Password must be at least 8 characters"),
    })
    .superRefine((data, ctx) => {
      // Phone validation
      if (!isValidPhoneNumber(data.mobile_number)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mobile_number"],
          message: "Invalid phone number",
        });
      }

      // Password match
      if (data.password !== data.confirm_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["confirm_password"],
          message: "Passwords do not match",
        });
      }
    });

/**
 * Update User Schema
 */
export const userUpdateSchema = (currRole) =>
  baseUserSchema
    .extend({
      organization: organizationSchema.optional().nullable(),
      organization_id: z.string().uuid().optional().nullable(),
    })
    .superRefine((data, ctx) => {
      // Phone validation
      if (!isValidPhoneNumber(data.mobile_number)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mobile_number"],
          message: "Invalid phone number",
        });
      }
    });

// user invite accept schema
export const userInviteAcceptSchema = baseUserSchema
  .omit({ role: true })
  .extend({
    token: z
      .string({ required_error: "Token is required." })
      .min(1, { message: "Token is required." }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters"),
  })
  .superRefine((data, ctx) => {
    // Phone validation
    if (!isValidPhoneNumber(data.mobile_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mobile_number"],
        message: "Invalid phone number",
      });
    }

    // Password match
    if (data.password !== data.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirm_password"],
        message: "Passwords do not match",
      });
    }
  });

/**
 * OTP Schema
 */
export const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});
