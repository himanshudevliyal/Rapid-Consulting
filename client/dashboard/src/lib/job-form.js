// Form <-> API conversion for jobs.

export const emptyJob = {
  title: "",
  slug: "",
  job_type: "full-time",
  location: "",
  experience: "",
  closing_date: "",
  description: "",
  responsibilities: "",
  requirements: "",
  is_active: true,
};

export const toFormValues = (job) => {
  if (!job) return emptyJob;
  return {
    title: job.title ?? "",
    slug: job.slug ?? "",
    job_type: job.job_type ?? "full-time",
    location: job.location ?? "",
    experience: job.experience ?? "",
    closing_date: job.closing_date ? String(job.closing_date).slice(0, 10) : "",
    description: job.description ?? "",
    responsibilities: job.responsibilities ?? "",
    requirements: job.requirements ?? "",
    is_active: job.is_active ?? true,
  };
};

// An empty slug is left out: on create the server makes one from the title,
// on edit the current slug stays. An empty closing date clears it.
export const buildPayload = (values) => {
  const payload = {
    title: values.title.trim(),
    job_type: values.job_type,
    location: values.location.trim(),
    experience: values.experience.trim(),
    closing_date: values.closing_date || "",
    description: values.description,
    responsibilities: values.responsibilities,
    requirements: values.requirements,
    is_active: values.is_active,
  };
  const slug = values.slug.trim();
  if (slug) payload.slug = slug;
  return payload;
};
