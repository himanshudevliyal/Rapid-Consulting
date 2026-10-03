import PageContainer from "@/components/layout/page-container";
import ProductVariantForm from "./product-variant-form";

export default function VariantCreatePage() {
  return (
    <PageContainer
      pageTitle={"Create product variant"}
      pageDescription={"Create product variant."}
    >
      <ProductVariantForm type="create" />
    </PageContainer>
  );
}
