import PageContainer from "@/components/layout/page-container";
import CategoryForm from "./category-form";

export default function CategoryCreatePage() {
  return (
    <PageContainer
      pageTitle={"Create category"}
      pageDescription={"Create category."}
    >
      <CategoryForm type="create" />
    </PageContainer>
  );
}
