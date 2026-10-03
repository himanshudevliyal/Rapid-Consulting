import PageContainer from "@/components/layout/page-container";
import SubCategoryForm from "./sub-category-form";

export default function SubCategoryEditPage({ id }) {
  return (
    <PageContainer
      pageTitle={"Edit sub category"}
      pageDescription={"Edit sub category."}
    >
      <SubCategoryForm type="edit" id={id} />
    </PageContainer>
  );
}
