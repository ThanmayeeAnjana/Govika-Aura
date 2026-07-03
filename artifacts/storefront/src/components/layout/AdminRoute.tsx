import { useGetAdminSession, getGetAdminSessionQueryKey } from "@workspace/api-client-react";
import { Redirect } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = useGetAdminSession({
    query: {
      queryKey: getGetAdminSessionQueryKey(),
      retry: false
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
    );
  }

  if (!session?.authenticated) {
    return <Redirect to="/admin/login" />;
  }

  return <>{children}</>;
}
