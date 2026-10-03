import PageContainer from "@/components/layout/page-container";
import CategoryForm from "./category-form";

export default function CategoryEditPage({ id }) {
  return (
    <PageContainer
      pageTitle={"Edit category"}
      pageDescription={"Edit category."}
    >
      <CategoryForm type="edit" id={id} />
    </PageContainer>
  );
}
