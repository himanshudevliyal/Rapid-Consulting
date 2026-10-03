import OrderEditPage from "@/features/orders/components/order-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <OrderEditPage id={id} />;
}
