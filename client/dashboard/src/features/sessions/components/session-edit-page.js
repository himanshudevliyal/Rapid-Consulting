import PageContainer from "@/components/layout/page-container";
import SessionForm from "./session-form";

export default function SessionEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Session"} pageDescription={"Update the session."} scrollable>
      <div className="max-w-5xl">
        <SessionForm type="edit" id={id} />
      </div>
    </PageContainer>
  );
}
