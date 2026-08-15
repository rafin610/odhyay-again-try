import { trpc } from "@/lib/trpc";

export function useAuth() {
  const me = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();
  const utils = trpc.useUtils();

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        void utils.auth.me.invalidate();
        void utils.auth.me.refetch();
      },
    });
  };

  return {
    user: me.data ?? null,
    loading: me.isLoading,
    isAuthenticated: Boolean(me.data),
    logout,
  };
}