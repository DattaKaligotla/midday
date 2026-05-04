import { ExportStatus } from "@/components/export-status";
import { GlobalTimerProvider } from "@/components/global-timer-provider";
import { Header } from "@/components/header";
import { GlobalSheetsProvider } from "@/components/sheets/global-sheets-provider";
import { Sidebar } from "@/components/sidebar";
import { TimezoneDetector } from "@/components/timezone-detector";
import { HydrateClient } from "@/trpc/server";

// ⚠️ FARADAY DEMO MODE — original tRPC user fetch + onboarding/login redirects
// stripped so the sidebar layout renders without a real API. Restore before
// any non-local deployment.
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HydrateClient>
      <div className="relative">
        <Sidebar />

        <div className="md:ml-[70px] pb-4">
          <Header />
          <div className="px-4 md:px-8">{children}</div>
        </div>

        <ExportStatus />
        <GlobalSheetsProvider />
        <GlobalTimerProvider />
        <TimezoneDetector />
      </div>
    </HydrateClient>
  );
}
