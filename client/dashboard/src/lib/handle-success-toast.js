import { toastManager } from "@/components/ui/toast";

export const handleSuccessToast = ({ message = "", title = null }) => {
  toastManager.add({
    title: title ?? "Success",
    description: message,
    type: "success",
  });
};
