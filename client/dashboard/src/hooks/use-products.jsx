// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/product-service";

export const useProducts = (searchParams = "") => {
  return useQuery({
    queryKey: ["products", searchParams],
    queryFn: () => fetchProducts(searchParams),
  });
};

export const useFormattedProducts = (searchParams = "") => {
  return useQuery({
    queryKey: ["products", searchParams],
    queryFn: () => fetchProducts(searchParams),
    select: ({ products }) => {
      return products?.map((b) => ({
        value: b.id,
        label: b.title,
      }));
    },
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      callback?.();
    },
  });
};

export const useUpdateProduct = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product) => updateProduct(id, product),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      callback?.();
    },
  });
};

export const useDeleteProduct = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      callback?.();
    },
  });
};
