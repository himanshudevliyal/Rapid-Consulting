import PageContainer from "@/components/layout/page-container";
import NavigationSettings from "./navigation-settings";

export default function NavigationSettingsPage() {
  return (
    <PageContainer
      pageTitle={"Navigation"}
      pageDescription={"The main menu destinations and the footer links of the website. They apply to every page and both languages."}
      scrollable
    >
      <NavigationSettings />
    </PageContainer>
  );
}
