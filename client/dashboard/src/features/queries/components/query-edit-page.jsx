import PageContainer from "@/components/layout/page-container";
import { QueryForm } from "./query-form";

export default async function QueryEditPage({ id }) {
  return (
    <PageContainer pageTitle="Edit query" pageDescription="Edit query.">
      <QueryForm id={id} type="edit" />
    </PageContainer>
  );
}
