// ⚠️ FARADAY DEMO MODE — replaces the network-going tRPC link with one that
// resolves every query/mutation locally with canned data so the dashboard
// renders without a real `@midday/api` running on :3003. Restore by swapping
// back to `httpLink` / `httpBatchStreamLink` before any non-local deployment.

import type { TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";

const NOW = new Date().toISOString();
const DAY_MS = 86400000;
const isoDays = (d: number) => new Date(Date.now() - d * DAY_MS).toISOString();

const DEMO_USER = {
  id: "demo-user",
  email: "demo@example.com",
  fullName: "Demo User",
  avatarUrl: null,
  locale: "en",
  weekStartsOnMonday: false,
  timezone: "UTC",
  timeFormat: 24,
  dateFormat: "yyyy-MM-dd",
  teamId: "demo-team",
  team: {
    id: "demo-team",
    name: "Demo Team",
    plan: "pro",
    createdAt: isoDays(120),
    canceledAt: null,
    baseCurrency: "USD",
    inboxEmail: "demo@inbox.midday.ai",
    countryCode: "US",
    documentClassification: false,
    flags: [],
  },
  createdAt: isoDays(120),
  updatedAt: NOW,
};

const DEMO_TEAM_MEMBERS = [
  { id: "demo-user", fullName: "Demo User", email: "demo@example.com", role: "owner", avatarUrl: null },
  { id: "demo-2", fullName: "Sam Reyes", email: "sam@example.com", role: "member", avatarUrl: null },
  { id: "demo-3", fullName: "Priya Patel", email: "priya@example.com", role: "member", avatarUrl: null },
];

const TX_VENDORS = ["Stripe", "AWS", "Vercel", "Linear", "Notion", "GitHub", "Figma", "Slack"];
const DEMO_TRANSACTIONS = Array.from({ length: 25 }, (_, i) => ({
  id: `demo-tx-${i}`,
  name: `${TX_VENDORS[i % TX_VENDORS.length]} subscription`,
  description: null,
  amount: -((i + 1) * 14.5),
  currency: "USD",
  date: isoDays(i),
  status: i % 3 === 0 ? "pending" : "completed",
  category: { id: "subscriptions", name: "Subscriptions", color: "#3B82F6" },
  bankAccount: { id: "demo-acct", name: "Operating", currency: "USD" },
  attachments: [],
  isFulfilled: i % 4 !== 0,
}));

const DEMO_INVOICES = Array.from({ length: 8 }, (_, i) => ({
  id: `demo-inv-${i}`,
  invoiceNumber: `INV-2026-${String(i + 1).padStart(3, "0")}`,
  status: ["draft", "unpaid", "paid", "overdue", "canceled"][i % 5],
  customer: { id: `demo-cust-${i}`, name: `Customer ${i + 1}`, email: `customer${i}@example.com` },
  amount: (i + 1) * 1250,
  currency: "USD",
  dueDate: isoDays(-(i + 1) * 7),
  issueDate: isoDays(i * 4),
}));

const DEMO_CUSTOMERS = Array.from({ length: 12 }, (_, i) => ({
  id: `demo-cust-${i}`,
  name: `Customer ${i + 1}`,
  email: `customer${i}@example.com`,
  phone: null,
  website: null,
  countryCode: "US",
  contact: null,
  vatNumber: null,
}));

const DEMO_PROJECTS = Array.from({ length: 6 }, (_, i) => ({
  id: `demo-proj-${i}`,
  name: ["Q2 redesign", "Mobile app", "Dashboard v2", "API gateway", "Analytics", "Integrations"][i],
  status: i % 2 === 0 ? "in_progress" : "completed",
  customer: DEMO_CUSTOMERS[i],
  rate: (i + 1) * 75,
  currency: "USD",
  estimate: (i + 1) * 40,
  billable: true,
}));

const SUMMARY_RANGES = ["last_30d", "last_90d", "last_year"] as const;

function mock(path: string, _input: unknown): unknown {
  // Per-path canned responses. Anything missing falls through to a permissive default.
  switch (path) {
    case "user.me":
      return DEMO_USER;
    case "team.current":
    case "team.get":
      return DEMO_USER.team;
    case "team.list":
      return [DEMO_USER.team];
    case "team.members":
    case "team.invitations":
      return DEMO_TEAM_MEMBERS;
    case "team.connectionStatus":
      return {
        bankConnections: [
          {
            id: "demo-conn-1",
            name: "Demo Bank",
            logoUrl: null,
            status: "connected",
            lastAccessed: NOW,
            expiresAt: null,
            errorRetries: 0,
            errorDetails: null,
            accounts: [
              { id: "demo-acct", name: "Operating", currency: "USD", enabled: true },
            ],
          },
        ],
        inboxAccounts: [],
      };
    case "notifications.list":
      return { data: [], nextCursor: null };
    case "connectors.connections":
      return [];
    case "trackerEntries.getTimerStatus":
      return { isRunning: false, projectId: null, startedAt: null };
    case "search.global":
      return { items: [], totalCount: 0 };
    case "invoice.defaultSettings":
      return {
        size: "a4",
        delivery: "create",
        currency: "USD",
        dateFormat: "yyyy-MM-dd",
        includeVat: false,
        includeTax: false,
        fromLabel: "From",
        billToLabel: "To",
        invoiceNoLabel: "Invoice No",
        issueDateLabel: "Issue Date",
        dueDateLabel: "Due Date",
        descriptionLabel: "Description",
        priceLabel: "Price",
        quantityLabel: "Quantity",
        totalLabel: "Total",
        totalSummaryLabel: "Total",
        vatLabel: "VAT",
        taxLabel: "Tax",
        paymentLabel: "Payment Details",
        noteLabel: "Note",
        logoUrl: null,
      };
    case "invoice.get":
    case "invoice.list":
      return { data: DEMO_INVOICES, nextCursor: null };
    case "invoice.summary":
      return SUMMARY_RANGES.reduce<Record<string, unknown>>((acc, r) => {
        acc[r] = { totalAmount: 18500, count: 8, currency: "USD" };
        return acc;
      }, {});
    case "customers.list":
      return { data: DEMO_CUSTOMERS, nextCursor: null };
    case "customers.get":
      return DEMO_CUSTOMERS[0];
    case "transactions.list":
    case "transactions.get":
      return { data: DEMO_TRANSACTIONS, nextCursor: null };
    case "transactions.getById":
      return DEMO_TRANSACTIONS[0];
    case "transactions.summary":
      return { totalAmount: -8421.5, count: 25, currency: "USD" };
    case "metrics.spending":
    case "metrics.revenue":
    case "metrics.profit":
    case "metrics.runway":
    case "metrics.burnRate":
    case "metrics.expense":
      return {
        summary: { currentTotal: 24500, prevTotal: 18200, currency: "USD" },
        meta: { type: "amount", currency: "USD" },
        result: Array.from({ length: 30 }, (_, i) => ({
          date: isoDays(29 - i),
          value: 800 + Math.round(Math.sin(i / 4) * 200) + i * 12,
          currency: "USD",
        })),
      };
    // Card-level reports — each card expects an array of { date, value, currency }.
    case "reports.burnRate":
      return Array.from({ length: 12 }, (_, i) => ({
        date: new Date(Date.now() - (11 - i) * 30 * DAY_MS).toISOString().slice(0, 10),
        value: 28000 + Math.round(Math.sin(i / 2) * 4000) + i * 350,
        currency: "USD",
      }));
    case "reports.revenue": {
      const result = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(Date.now() - (11 - i) * 30 * DAY_MS).toISOString().slice(0, 10);
        const current = 38000 + Math.round(Math.cos(i / 2) * 5500) + i * 600;
        const previous = current - 4500 - Math.round(Math.sin(i / 3) * 1500);
        return {
          date,
          current: { date, value: current, currency: "USD" },
          previous: { date, value: previous, currency: "USD" },
        };
      });
      const currentTotal = result.reduce((s, r) => s + r.current.value, 0);
      const prevTotal = result.reduce((s, r) => s + r.previous.value, 0);
      return {
        summary: { currentTotal, prevTotal, averageRevenue: Math.round(currentTotal / 12), currency: "USD" },
        meta: { type: "amount", currency: "USD" },
        result,
      };
    }
    case "reports.expense":
    case "reports.spending": {
      const result = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(Date.now() - (11 - i) * 30 * DAY_MS).toISOString().slice(0, 10);
        const current = 22000 + Math.round(Math.sin(i / 3) * 3500) + i * 250;
        const recurring = Math.round(current * 0.65);
        return {
          date,
          value: current,
          recurring,
          total: current,
          currency: "USD",
          current: { date, value: current, currency: "USD" },
          previous: { date, value: current - 1800, currency: "USD" },
        };
      });
      const currentTotal = result.reduce((s, r) => s + r.value, 0);
      return {
        summary: {
          currentTotal,
          prevTotal: currentTotal - 12000,
          averageExpense: Math.round(currentTotal / 12),
          currency: "USD",
        },
        meta: { type: "amount", currency: "USD" },
        result,
      };
    }
    case "reports.profit":
      return Array.from({ length: 12 }, (_, i) => ({
        date: new Date(Date.now() - (11 - i) * 30 * DAY_MS).toISOString().slice(0, 10),
        value: 9000 + Math.round(Math.cos(i / 4) * 2500) + i * 200,
        currency: "USD",
      }));
    case "reports.runway":
      return Array.from({ length: 12 }, (_, i) => ({
        date: new Date(Date.now() - (11 - i) * 30 * DAY_MS).toISOString().slice(0, 10),
        value: Math.max(2, 18 - i),
        currency: "USD",
      }));
    case "reports.revenueForecast":
      return {
        forecast: Array.from({ length: 6 }, (_, i) => ({
          date: new Date(Date.now() + (i + 1) * 30 * DAY_MS).toISOString().slice(0, 10),
          value: 42000 + i * 1500,
          currency: "USD",
        })),
        currency: "USD",
      };
    case "reports.getAccountBalances":
      return [
        { date: isoDays(60), balance: 105000, currency: "USD" },
        { date: isoDays(45), balance: 112400, currency: "USD" },
        { date: isoDays(30), balance: 118200, currency: "USD" },
        { date: isoDays(15), balance: 121800, currency: "USD" },
        { date: isoDays(0), balance: 124500, currency: "USD" },
      ];
    case "reports.taxSummary":
      return { totalTax: 4250, currency: "USD", periods: [] };
    case "overview.summary":
      return {
        openInvoices: { count: 4, totalAmount: 12450, currency: "USD" },
        unbilledTime: {
          totalDuration: 86400,
          totalAmount: 3200,
          projectCount: 3,
          currency: "USD",
        },
        inboxPending: { count: 7 },
        transactionsToReview: { count: 5 },
        cashBalance: { totalBalance: 124500, currency: "USD", accountCount: 1 },
        runway: 14,
      };
    case "institutions.get":
      return [];
    case "categories.list":
      return [
        { id: "subscriptions", name: "Subscriptions", color: "#3B82F6" },
        { id: "infrastructure", name: "Infrastructure", color: "#10B981" },
        { id: "office", name: "Office", color: "#F59E0B" },
        { id: "travel", name: "Travel", color: "#EF4444" },
        { id: "salary", name: "Salary", color: "#8B5CF6" },
      ];
    case "tags.list":
      return [];
    case "trackerProjects.list":
      return { data: DEMO_PROJECTS, nextCursor: null };
    case "documents.list":
      return { data: [], nextCursor: null };
    case "inbox.list":
      return { data: [], nextCursor: null };
    case "bankAccounts.list":
    case "bankAccounts.get":
      return [
        {
          id: "demo-acct",
          name: "Operating",
          currency: "USD",
          balance: 124500,
          enabled: true,
          type: "depository",
          accountReference: null,
        },
      ];
    case "bankConnections.get":
    case "bankConnections.list":
      return [
        {
          id: "demo-conn-1",
          name: "Demo Bank",
          logoUrl: null,
          provider: "plaid",
          status: "connected",
          lastAccessed: NOW,
          expiresAt: null,
          errorRetries: 0,
          errorDetails: null,
          accounts: [
            {
              id: "demo-acct",
              name: "Operating",
              currency: "USD",
              balance: 124500,
              enabled: true,
              type: "depository",
            },
          ],
        },
      ];
    case "tags.get":
    case "tags.list":
      return [
        { id: "tag-1", name: "recurring", color: "#3B82F6" },
        { id: "tag-2", name: "tax-deductible", color: "#10B981" },
        { id: "tag-3", name: "needs-review", color: "#F59E0B" },
      ];
    case "trackerEntries.list":
      return { data: [], nextCursor: null };
    case "vault.list":
      return { data: [], nextCursor: null };
    case "apps.list":
      return [];
    case "apiKeys.list":
      return [];
    case "shortLinks.list":
      return { data: [], nextCursor: null };
    default:
      // Best-effort defaults so previously-unseen paths still resolve cleanly.
      // Many Midday `.get` paths on plural entities are infinite queries and
      // expect a `{ data, nextCursor }` page shape — when in doubt, return that.
      if (path.endsWith(".list")) return { data: [], nextCursor: null };
      if (path.endsWith(".getById")) return null;
      if (path.endsWith(".get")) return { data: [], nextCursor: null };
      if (path.endsWith(".count")) return 0;
      if (path.endsWith(".summary")) return null;
      return null;
  }
}

export function makeMockLink<TRouter extends Record<string, unknown>>(): TRPCLink<TRouter> {
  return () => {
    return ({ op }) =>
      observable((observer) => {
        try {
          const data = mock(op.path, op.input);
          // eslint-disable-next-line no-console
          console.log("[faraday-mock]", op.path, "→", data);
          observer.next({ result: { type: "data", data } });
          observer.complete();
        } catch (err) {
          observer.error(err as never);
        }
      });
  };
}
