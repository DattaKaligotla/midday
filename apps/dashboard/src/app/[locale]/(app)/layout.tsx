// ⚠️ FARADAY DEMO MODE — original auth gate (createClient + getUser + redirect)
// stripped so the dashboard renders without a real Supabase. Restore before any
// non-local deployment.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
