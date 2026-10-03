import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProductInquiries,
  fetchProductInquiry,
  updateProductInquiryStatus,
  deleteProductInquiry,
} from "@/services/product-inquiry-service";

export const useProductInquiries = (searchParams = "") => {
  return useQuery({
    queryKey: ["product-inquiries", searchParams],
    queryFn: () => fetchProductInquiries(searchParams),
  });
};

export const useProductInquiry = (id) => {
  return useQuery({
    queryKey: ["product-inquiries", id],
    queryFn: () => fetchProductInquiry(id),
    enabled: !!id,
  });
};

export const useUpdateProductInquiryStatus = (id, callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["product-inquiries", id],
    mutationFn: (status) => updateProductInquiryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-inquiries"] });
      callback?.();
    },
  });
};

export const useDeleteProductInquiry = (id, callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["product-inquiries", id],
    mutationFn: () => deleteProductInquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-inquiries"] });
      callback?.();
    },
  });
};
