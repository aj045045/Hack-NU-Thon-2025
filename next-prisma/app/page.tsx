import { pageLinks } from "@/constants/links";
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect(pageLinks.home);
}
