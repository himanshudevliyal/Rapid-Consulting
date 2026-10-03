import PageContainer from "@/components/layout/page-container";
import ProductForm from "./product-form";

export default function ProductEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit product"} pageDescription={"Edit product."}>
      <ProductForm type="edit" id={id} />
    </PageContainer>
  );
}
