import PageContainer from "@/components/layout/page-container";
import ProductVariantForm from "./product-variant-form";

export default function VariantEditPage({ id }) {
  return (
    <PageContainer
      pageTitle={"Edit product variant"}
      pageDescription={"Edit product variant."}
    >
      <ProductVariantForm type="edit" id={id} />
    </PageContainer>
  );
}
