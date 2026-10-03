// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProductVariant,
  deleteProductVariant,
  fetchProductVariant,
  fetchProductVariants,
  updateProductVariant,
} from "@/services/product-variant-services";

export const useProductVariants = (searchParams = "") => {
  return useQuery({
    queryKey: ["product-variants", searchParams],
    queryFn: () => fetchProductVariants(searchParams),
  });
};

export const useFormattedProductVariants = (searchParams = "") => {
  return useQuery({
    queryKey: ["product-variants", searchParams],
    queryFn: () => fetchProductVariants(searchParams),
    select: ({ products }) => {
      return products?.map((b) => ({
        value: b.id,
        label: b.title,
      }));
    },
  });
};

export const useProductVariant = (id) => {
  return useQuery({
    queryKey: ["product-variants", id],
    queryFn: () => fetchProductVariant(id),
    enabled: !!id,
  });
};

export const useCreateProductVariant = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      callback?.();
    },
  });
};

export const useUpdateProductVariant = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product) => updateProductVariant(id, product),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      callback?.();
    },
  });
};

export const useDeleteProductVariant = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProductVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      callback?.();
    },
  });
};
