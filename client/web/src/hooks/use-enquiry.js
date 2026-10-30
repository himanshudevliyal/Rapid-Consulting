import { useMutation } from "@tanstack/react-query";
import { submitContactEnquiry, submitEnquiry } from "@/services/enquiry-service";
import { apiErrorMessage } from "@/utils/api-helpers";

// All hooks return the React Query mutation (mutate / mutateAsync, isPending,
// isSuccess, isError, reset) plus `errorMessage` ready to show under the form.
// `meta.silent` stops the global error toast: the form shows the error itself.
const formMutation = (mutationFn) => () => {
  const mutation = useMutation({ mutationFn, meta: { silent: true } });
  return { ...mutation, errorMessage: mutation.isError ? apiErrorMessage(mutation.error) : "" };
};

// "Request a callback" -> POST /enquiries
export const useSubmitEnquiry = formMutation(submitEnquiry);

// Contact Us page -> POST /contact-enquiries
export const useSubmitContactEnquiry = formMutation(submitContactEnquiry);
