import { handleError } from "@/lib/handle-error-toast";
import { handleSuccessToast } from "@/lib/handle-success-toast";
import auth from "@/services/auth";
import user from "@/services/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetUsers = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["users", searchParams],
    queryFn: () => user.get(searchParams),
    enabled: !!searchParams,
  });
};

export const useFormattedUsers = (searchParams = "page=1", options = {}) => {
  return useQuery({
    queryKey: ["users", searchParams],
    queryFn: () => user.get(searchParams),
    select: ({ users }) => {
      return (
        users?.map((user) => ({
          value: user.id,
          label: `${user.fullname} (${user.role})`,
        })) ?? []
      );
    },
    ...options,
  });
};

export const useGetUserProfile = (id) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => user.getById(id),
    enabled: !!id,
  });
};

export const useGetUserCompanyProfile = (id) => {
  return useQuery({
    queryKey: ["user-company-profile", id],
    queryFn: () => user.getUserCompanyProfile(id),
    enabled: !!id,
  });
};

export const useGetUserContacts = (id) => {
  return useQuery({
    queryKey: ["user-key-contact", id],
    queryFn: () => user.getUserContacts(id),
    enabled: !!id,
  });
};

export const useGetUser = (id) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => user.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: user.create,
    onSuccess: () => {
      handleSuccessToast({ message: "User created successfully." });
      queryClient.invalidateQueries(["users"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
  });
};

export const useUpdateUser = (id, callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => user.update(id, data),
    onSuccess: () => {
      handleSuccessToast({ message: "User updated successfully." });
      queryClient.invalidateQueries(["users"]);
      callback?.();
    },
  });
};

export const useDeleteUser = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => user.deleteById(id),
    onSuccess: () => {
      handleSuccessToast({ message: "User deleted successfully." });
      queryClient.invalidateQueries(["users"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
  });
};

export const useAcceptInvite = (callback) => {
  return useMutation({
    mutationFn: auth.acceptInvite,
    onSuccess: () => {
      handleSuccessToast({ message: "Registered successfully." });
      callback?.();
    },
  });
};
