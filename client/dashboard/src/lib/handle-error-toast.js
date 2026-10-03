import { toastManager } from "@/components/ui/toast";

export const handleError = ({
  error,
  title = null,
  defaultMessage = "Uh oh! Something went wrong.",
}) => {
  const message =
    error?.response?.data?.message ?? error?.message ?? defaultMessage;

  toastManager.add({
    title: title ?? "Error",
    description: message,
    type: "error",
  });
};
