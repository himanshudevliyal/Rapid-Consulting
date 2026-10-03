import ProductEditPage from "@/features/products/components/product-edit-page";

export default async function EditPage({ params }) {
  const { id } = await params;
  return <ProductEditPage id={id} />;
}
