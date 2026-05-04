"use client";

import type { Database } from "@midday/supabase/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type PublicSchema = Database[Extract<keyof Database, "public">];
type Tables = PublicSchema["Tables"];
type TableName = keyof Tables;

type EventType = "INSERT" | "UPDATE" | "DELETE";

interface UseRealtimeProps<TN extends TableName> {
  channelName: string;
  events?: EventType[];
  table: TN;
  filter?: string;
  onEvent: (payload: RealtimePostgresChangesPayload<Tables[TN]["Row"]>) => void;
}

// ⚠️ FARADAY DEMO MODE — Supabase Realtime is stubbed to a no-op so we don't
// thrash the console with WebSocket connection failures against the dummy
// localhost:54321 URL. Restore the original implementation before any non-local
// deployment.
export function useRealtime<TN extends TableName>(_props: UseRealtimeProps<TN>): void {
  return;
}
