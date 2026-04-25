import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import { getCurrentUser, Role } from "@/lib/rbac";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // For the assignment requirements, only admin can access dashboard
  if (user.role !== Role.ADMIN) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Unauthorized</h1>
          <p className="text-slate-600">Admin access required</p>
          <p className="text-sm text-slate-500 mt-2">
            Only administrators can access the dashboard and upload audio files.
          </p>
        </div>
      </div>
    );
  }

  return <DashboardClient user={user} />;
}
