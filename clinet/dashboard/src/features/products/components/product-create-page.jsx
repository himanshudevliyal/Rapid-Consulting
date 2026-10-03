import PageContainer from "@/components/layout/page-container";
import ProductForm from "./product-form";

export default function ProductCreatePage({}) {
  return (
    <PageContainer
      pageTitle={"Create products"}
      pageDescription={"Create products."}
    >
      <ProductForm type="create" />
    </PageContainer>
  );
}
