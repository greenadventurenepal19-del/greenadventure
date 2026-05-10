import { AdminAuthProvider } from "@/components/admin-auth-provider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Green Adventure",
  description: "Secure admin portal for managing green adventure",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-500/30">
      <AdminAuthProvider>
        {children}
      </AdminAuthProvider>
    </div>
  );
}
