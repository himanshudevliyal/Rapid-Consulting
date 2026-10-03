import PageContainer from "@/components/layout/page-container";
import { QueryForm } from "./query-form";

export default function QueryCreatePage() {
  return (
    <PageContainer pageTitle="Create query" pageDescription="Create query.">
      <QueryForm type="create" />
    </PageContainer>
  );
}
