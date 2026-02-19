import { redirect } from "next/navigation";

export default function AllowedOriginsPage() {
  redirect("/dashboard/projects");
}
