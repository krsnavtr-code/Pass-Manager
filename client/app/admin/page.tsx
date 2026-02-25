// client\app\admin\page.tsx
import { redirect } from "next/navigation";

// Since this is a simple redirect, we don't even need "use client"
export default function AdminPage() {
  redirect("/admin/dashboard");
}