import { pageLinks } from "@/constants/links";
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect(pageLinks.admin.dashboard);
}
