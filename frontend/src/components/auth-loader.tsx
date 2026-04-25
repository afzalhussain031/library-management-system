import { useAuth } from "../hooks";

export function AuthLoader({ children }: { children: React.ReactNode; }) {
  const { loading } = useAuth();

  if (!loading) { return children; }

  return <div className="h-svh flex justify-center items-center">Loading...</div>;
}
