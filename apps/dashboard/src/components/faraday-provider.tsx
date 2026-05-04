"use client";

import {
  Modifiable,
  UIAgentLauncher,
  UIAgentProvider,
} from "@faraday/ui-agent";
import "@faraday/ui-agent/style.css";
import type { ReactNode } from "react";

type FaradayProviderProps = {
  children: ReactNode;
};

// FaradayStack agent — wraps the entire Midday dashboard so the agent has a
// single root container to anchor against. Credentials come from public env
// vars minted by setup_demo.py.
export function FaradayProvider({ children }: FaradayProviderProps) {
  const publishableKey = process.env.NEXT_PUBLIC_FARADAY_PUBLISHABLE_KEY;
  const userToken = process.env.NEXT_PUBLIC_FARADAY_USER_TOKEN;
  const apiUrl = process.env.NEXT_PUBLIC_FARADAY_API_URL;

  const connection = publishableKey
    ? {
        publishableKey,
        userToken: userToken ?? null,
        apiUrl: apiUrl ?? "http://localhost:8000/v1/stream",
      }
    : { endpoint: apiUrl ?? "/agent" };

  return (
    <UIAgentProvider {...connection}>
      <Modifiable id="midday-root" type="container" as="div">
        {children}
      </Modifiable>
      <UIAgentLauncher />
    </UIAgentProvider>
  );
}
