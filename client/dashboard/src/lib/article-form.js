// Form <-> API conversion for articles.
import { authorFieldsDefaults, authorFieldsFromRecord, authorFieldsPayload } from "@/lib/author-fields";

export const emptyArticle = {
  title: "",
  slug: "",
  excerpt: "",
  cover_image: "",
  pdf_url: "",
  category_id: "",
  tags: "",
  type: "article",
  is_published: false,
  content: "",
  meta_title: "",
  meta_description: "",
  ...authorFieldsDefaults,
};

// API record -> form values (tags become a comma separated line).
export const toFormValues = (article) => {
  if (!article) return emptyArticle;
  return {
    title: article.title ?? "",
    slug: article.slug ?? "",
    excerpt: article.excerpt ?? "",
    cover_image: article.cover_image ?? "",
    pdf_url: article.pdf_url ?? "",
    category_id: article.category_id ?? "",
    tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
    type: article.type === "guide" ? "guide" : "article",
    is_published: !!article.is_published,
    content: article.content ?? "",
    meta_title: article.meta_title ?? "",
    meta_description: article.meta_description ?? "",
    ...authorFieldsFromRecord(article),
  };
};

// Form values -> request body. An empty slug is left out: on create the
// server makes one from the title, on edit the current slug stays.
export const buildPayload = (values) => {
  const payload = {
    title: values.title.trim(),
    excerpt: values.excerpt.trim(),
    cover_image: values.cover_image.trim(),
    pdf_url: (values.pdf_url ?? "").trim(),
    category_id: values.category_id || "",
    tags: values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    type: values.type,
    is_published: values.is_published,
    content: values.content,
    meta_title: values.meta_title.trim(),
    meta_description: values.meta_description.trim(),
    ...authorFieldsPayload(values),
  };
  const slug = values.slug.trim();
  if (slug) payload.slug = slug;
  return payload;
};
