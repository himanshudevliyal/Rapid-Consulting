// { field: "first message" } from a ZodError, so a form can show each message
// under its own field. Fields with no name (whole body) are left out.
export const fieldErrors = (error) => {
  const errors = {};
  for (const issue of error.issues ?? []) {
    const field = issue.path?.[0];
    if (typeof field === "string" && !(field in errors)) errors[field] = issue.message;
  }
  return errors;
};

// Reply for a failed public form: 400 with a readable message and the per-field messages.
export const sendValidationError = (res, error) =>
  res.code(400).send({
    status: false,
    success: false,
    error: "Bad Request",
    message: "Please check the highlighted fields.",
    errors: fieldErrors(error),
  });
