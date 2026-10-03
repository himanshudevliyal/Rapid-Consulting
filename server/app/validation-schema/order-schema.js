// schemas/orderSchema.js
import { z } from "zod";

export const addressSchema = z.object({
  fullname: z.string().min(1, "Fullname is required"),
  house: z.string().min(1, "House no. is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(3, "Postal code is required"),
  phone: z.string().min(6).optional(),
});

export const orderItemSchema = z.object({
  product_id: z.uuid({ message: "Invalid product id" }),
  quantity: z.number().int().positive({ message: "Quantity must be > 0" }),
  // Products no longer carry a catalog price, so the unit price for this
  // order line must be supplied explicitly (e.g. quoted/negotiated price).
  product_price: z.coerce
    .number()
    .min(0, "product_price must be >= 0"),
});

export const createOrderSchema = z.object({
  shipping_address: addressSchema,
  billing_address: addressSchema,
  order_items: z
    .array(orderItemSchema)
    .min(1, "order_items must contain at least one item"),
  // payment_method: z
  //   .enum(["card", "upi", "cod", "paypal", "bank_transfer", "cod"])
  //   .optional(),
  // coupon_code: z.string().trim().optional(),
});
