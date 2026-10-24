import { redirect } from "next/navigation";

// Enquiries are sent from the website; there is nothing to add here.
export default function CreatePage() {
  redirect("/enquiries?page=1&limit=10");
}
