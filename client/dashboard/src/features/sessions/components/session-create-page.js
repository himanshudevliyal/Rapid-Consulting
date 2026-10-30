import PageContainer from "@/components/layout/page-container";
import SessionForm from "./session-form";

export default function SessionCreatePage() {
  return (
    <PageContainer
      pageTitle={"Create Session"}
      pageDescription={"Add a webinar. Only the title is required; the slug is made from it."}
      scrollable
    >
      <div className="max-w-5xl">
        <SessionForm type="create" />
      </div>
    </PageContainer>
  );
}
