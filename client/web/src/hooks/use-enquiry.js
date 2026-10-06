import { useMutation } from "@tanstack/react-query";
import { submitEnquiry, submitQuery } from "@/services/enquiry-service";
import { apiErrorMessage } from "@/utils/api-helpers";

// Both hooks return the React Query mutation (mutate / mutateAsync, isPending,
// isSuccess, isError, reset) plus `errorMessage` ready to show under the form.
// `meta.silent` stops the global error toast: the form shows the error itself.
const formMutation = (mutationFn) => () => {
  const mutation = useMutation({ mutationFn, meta: { silent: true } });
  return { ...mutation, errorMessage: mutation.isError ? apiErrorMessage(mutation.error) : "" };
};

// "Request a callback" -> POST /enquiries
export const useSubmitEnquiry = formMutation(submitEnquiry);

// Contact-us -> POST /queries
export const useSubmitQuery = formMutation(submitQuery);
