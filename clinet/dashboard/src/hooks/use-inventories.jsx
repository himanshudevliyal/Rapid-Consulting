import {
  createInventory,
  deleteInventory,
  fetchInventories,
  fetchInventory,
  updateInventory,
} from "@/services/inventory-services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useInventories = (searchParams = "") => {
  return useQuery({
    queryKey: ["inventories", searchParams],
    queryFn: () => fetchInventories(searchParams),
  });
};

export const useInventory = (id) => {
  return useQuery({
    queryKey: ["inventories", id],
    queryFn: () => fetchInventory(id),
    enabled: !!id,
  });
};

export const useCreateInventory = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      callback?.();
    },
  });
};

export const useUpdateInventory = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["inventories", id],
    mutationFn: (data) => updateInventory(id, data),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      toast.success("Stock updated");
      callback?.();
    },
  });
};

export const useDeleteInventory = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["inventories", id],
    mutationFn: () => deleteInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      callback?.();
    },
  });
};
