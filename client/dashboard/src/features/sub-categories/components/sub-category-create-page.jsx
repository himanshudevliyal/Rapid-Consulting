import PageContainer from "@/components/layout/page-container";
import SubCategoryForm from "./sub-category-form";

export default function SubCategoryCreatePage() {
  return (
    <PageContainer
      pageTitle={"Create sub category"}
      pageDescription={"Create sub category."}
    >
      <SubCategoryForm type="create" />
    </PageContainer>
  );
}
