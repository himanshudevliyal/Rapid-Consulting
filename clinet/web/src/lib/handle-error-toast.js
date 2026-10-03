import { toast } from "sonner";

export const handleError = (error, defaultMessage = "Something went wrong.") => {
  const message = error?.response?.data?.message ?? error?.message ?? defaultMessage;
  toast.error("Error", { description: message });
};
