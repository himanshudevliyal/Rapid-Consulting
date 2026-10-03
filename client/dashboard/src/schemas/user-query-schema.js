import z from "zod";

export const userQuerySchema = z.object({
  name: z.string().min(1),

  email: z.email(),

  // address: z.string().min(1),

  phone: z.string().min(1),

  subject: z.string().min(1),

  message: z.string().min(1),
});
