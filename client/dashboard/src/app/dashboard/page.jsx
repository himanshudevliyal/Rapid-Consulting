"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  ChevronDown,
  ChevronRight,
  FileText,
  FolderTree,
  Inbox,
  LayoutGrid,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  ScrollText,
  Users as UsersIcon,
} from "lucide-react";
import PageContainer from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-dashboard";
import { useAllServiceFamilyTopics } from "@/hooks/use-service-options";
import { cn } from "@/lib/utils";

/* =========================================================
   Constants
========================================================= */

const TONES = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  slate: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const ENQUIRY_STATUS = {
  new: { label: "New", color: "var(--chart-2)", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  "in-progress": {
    label: "In progress",
    color: "hsl(210 80% 55%)",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
  },
  resolved: { label: "Resolved", color: "var(--chart-1)", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  spam: { label: "Spam", color: "hsl(0 0% 60%)", badge: "border-border bg-muted text-muted-foreground" },
};

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
];

const CREATE_LINKS = [
  { label: "Service", href: "/services/create", icon: Briefcase },
  { label: "Scheme", href: "/schemes/create", icon: ScrollText },
  { label: "Article", href: "/articles/create", icon: FileText },
  { label: "Case study", href: "/case-studies/create", icon: BookOpen },
];

/* =========================================================
   Helpers
========================================================= */

const formatNumber = (value) => (Number.isFinite(value) ? value.toLocaleString("en-IN") : "0");

const truncate = (text = "", max = 18) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

// Combine several queries into one loading / error / retry state.
const combine = (...queries) => ({
  isLoading: queries.some((query) => query.isLoading),
  isError: queries.some((query) => query.isError),
  refetch: () => queries.forEach((query) => query.refetch()),
});

// One bucket per day for the last `days` days, counting each kind of record.
const buildActivity = (enquiries, queries, days) => {
  const start = moment().startOf("day").subtract(days - 1, "days");
  const buckets = Array.from({ length: days }, (_, index) => {
    const day = moment(start).add(index, "days");
    return {
      key: day.format("YYYY-MM-DD"),
      label: day.format("DD MMM"),
      full: day.format("ddd, DD MMM YYYY"),
      enquiries: 0,
      queries: 0,
    };
  });
  const position = new Map(buckets.map((bucket, index) => [bucket.key, index]));

  const count = (rows, field) =>
    rows.forEach((row) => {
      const index = position.get(moment(row.created_at).format("YYYY-MM-DD"));
      if (index !== undefined) buckets[index][field] += 1;
    });
  count(enquiries, "enquiries");
  count(queries, "queries");

  return buckets;
};

/* =========================================================
   Shared building blocks
========================================================= */

function Panel({ title, description, href, action, className, children }) {
  return (
    <Card className={cn("flex flex-col rounded-xl border-border/60 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="min-w-0 space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        {action}
        {href && (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex-1 pt-0">{children}</CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon = Inbox, label, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-10 text-center", className)}>
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground/60">
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ErrorState({ onRetry, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-10 text-center", className)}>
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </div>
      <div>
        <p className="text-sm font-medium">Could not load this section</p>
        <p className="text-xs text-muted-foreground">Check your connection and try again.</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

// Shows the loading skeleton, the error with a retry, the empty message or the
// content, in that order.
function QueryState({ state, isEmpty, empty, skeleton, children }) {
  if (state.isLoading) return skeleton ?? <Skeleton className="h-60 w-full rounded-lg" />;
  if (state.isError) return <ErrorState onRetry={state.refetch} />;
  if (isEmpty) return <EmptyState {...empty} />;
  return children;
}

function ListSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   Stat cards
========================================================= */

function StatCard({ title, value, hint, icon: Icon, tone = "emerald", href, state }) {
  return (
    <Link href={href} className="group block focus-visible:outline-none">
      <Card className="h-full rounded-xl border-border/60 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
            {state.isLoading ? (
              <>
                <Skeleton className="mt-2 h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-24" />
              </>
            ) : state.isError ? (
              <>
                <p className="mt-1.5 text-3xl font-semibold tracking-tight text-muted-foreground/50">–</p>
                <p className="mt-1 text-xs text-destructive">Unavailable</p>
              </>
            ) : (
              <>
                <p className="mt-1.5 text-3xl font-semibold tracking-tight">{formatNumber(value)}</p>
                {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
              </>
            )}
          </div>
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11", TONES[tone])}>
            <Icon className="size-5" strokeWidth={1.8} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatCards({ data, services, topics }) {
  const rows = services.data?.rows ?? [];
  const live = rows.filter((row) => row.is_active && row.type !== "service-index").length;
  const recent = (list) =>
    (list.data?.rows ?? []).filter((row) => moment(row.created_at).isAfter(moment().subtract(7, "days"))).length;

  const published = (all, done) => ({
    value: all.data?.total ?? 0,
    hint: `${formatNumber(done.data?.total ?? 0)} published · ${formatNumber(
      Math.max((all.data?.total ?? 0) - (done.data?.total ?? 0), 0),
    )} draft`,
    state: combine(all, done),
  });

  const cards = [
    {
      title: "Services",
      icon: Briefcase,
      tone: "emerald",
      href: "/services?page=1&limit=10",
      value: services.data?.total ?? rows.length,
      hint: `${formatNumber(live)} live · ${formatNumber(Math.max(rows.length - live, 0))} hidden`,
      state: services,
    },
    { title: "Schemes", icon: ScrollText, tone: "violet", href: "/schemes?page=1&limit=10", ...published(data.schemes, data.schemesPublished) },
    { title: "Articles", icon: FileText, tone: "sky", href: "/articles?page=1&limit=10", ...published(data.articles, data.articlesPublished) },
    {
      title: "Case studies",
      icon: BookOpen,
      tone: "amber",
      href: "/case-studies?page=1&limit=10",
      ...published(data.caseStudies, data.caseStudiesPublished),
    },
    {
      title: "Enquiries",
      icon: MessageSquare,
      tone: "rose",
      href: "/enquiries?page=1&limit=10",
      value: data.enquiries.data?.total ?? 0,
      hint: `${formatNumber(data.newEnquiries.data?.total ?? 0)} new`,
      state: combine(data.enquiries, data.newEnquiries),
    },
    {
      title: "Queries",
      icon: Mail,
      tone: "sky",
      href: "/queries?page=1&limit=10",
      value: data.queries.data?.total ?? 0,
      hint: `${formatNumber(recent(data.queries))} in the last 7 days`,
      state: data.queries,
    },
    {
      title: "Categories",
      icon: LayoutGrid,
      tone: "violet",
      href: "/categories?page=1&limit=10",
      value: data.categories.data?.total ?? 0,
      hint: `${formatNumber(topics.data?.total ?? topics.data?.data?.length ?? 0)} family / topics`,
      state: data.categories,
    },
    {
      title: "Users",
      icon: UsersIcon,
      tone: "slate",
      href: "/users?page=1&limit=10",
      value: data.users.data?.total ?? 0,
      state: data.users,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}

/* =========================================================
   Charts
========================================================= */

const activityConfig = {
  enquiries: { label: "Enquiries", color: "var(--chart-1)" },
  queries: { label: "Queries", color: "var(--chart-2)" },
};

function RangeToggle({ value, onChange }) {
  return (
    <div className="inline-flex shrink-0 rounded-lg border bg-muted/40 p-0.5" role="group" aria-label="Date range">
      {RANGES.map((range) => (
        <button
          key={range.value}
          type="button"
          onClick={() => onChange(range.value)}
          aria-pressed={value === range.value}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === range.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

function ActivityChart({ enquiries, queries }) {
  const [days, setDays] = useState(30);
  const state = combine(enquiries, queries);

  const chartData = useMemo(
    () => buildActivity(enquiries.data?.rows ?? [], queries.data?.rows ?? [], days),
    [enquiries.data, queries.data, days],
  );
  const total = chartData.reduce((sum, day) => sum + day.enquiries + day.queries, 0);

  // The lists hold the latest 200 records; say so when older ones are left out.
  const capped = (enquiries.data?.total ?? 0) > (enquiries.data?.rows?.length ?? 0) || (queries.data?.total ?? 0) > (queries.data?.rows?.length ?? 0);

  return (
    <Panel
      title="Enquiries & queries"
      description={`Messages received in the last ${days} days`}
      className="xl:col-span-2"
      action={<RangeToggle value={days} onChange={setDays} />}
    >
      <QueryState
        state={state}
        isEmpty={total === 0}
        empty={{ icon: Inbox, label: `No enquiries or queries in the last ${days} days.` }}
        skeleton={<Skeleton className="h-64 w-full rounded-lg" />}
      >
        <ChartContainer config={activityConfig} className="aspect-auto h-64 w-full">
          <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              {Object.keys(activityConfig).map((key) => (
                <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={days > 7 ? 28 : 8} />
            <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
            <ChartTooltip
              cursor={{ strokeDasharray: "4 4" }}
              content={<ChartTooltipContent labelFormatter={(_, payload) => payload?.[0]?.payload?.full} indicator="dot" />}
            />
            <Area type="monotone" dataKey="queries" stroke="var(--color-queries)" strokeWidth={2} fill="url(#fill-queries)" />
            <Area type="monotone" dataKey="enquiries" stroke="var(--color-enquiries)" strokeWidth={2} fill="url(#fill-enquiries)" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
        {capped && (
          <p className="mt-2 text-center text-xs text-muted-foreground">Based on the latest 200 records of each kind.</p>
        )}
      </QueryState>
    </Panel>
  );
}

const contentConfig = {
  live: { label: "Published", color: "var(--chart-1)" },
  draft: { label: "Draft / hidden", color: "var(--chart-4)" },
};

function ContentChart({ data, services }) {
  const serviceRows = services.data?.rows ?? [];
  const liveServices = serviceRows.filter((row) => row.is_active && row.type !== "service-index").length;
  const hiddenServices = Math.max(serviceRows.length - liveServices, 0);

  const entry = (name, all, done) => ({
    name,
    live: done.data?.total ?? 0,
    draft: Math.max((all.data?.total ?? 0) - (done.data?.total ?? 0), 0),
  });

  const chartData = [
    { name: "Services", live: liveServices, draft: hiddenServices },
    entry("Schemes", data.schemes, data.schemesPublished),
    entry("Articles", data.articles, data.articlesPublished),
    entry("Case studies", data.caseStudies, data.caseStudiesPublished),
  ];
  const state = combine(
    services,
    data.schemes,
    data.schemesPublished,
    data.articles,
    data.articlesPublished,
    data.caseStudies,
    data.caseStudiesPublished,
  );
  const total = chartData.reduce((sum, item) => sum + item.live + item.draft, 0);

  return (
    <Panel title="Content status" description="Published and draft pages by type">
      <QueryState
        state={state}
        isEmpty={total === 0}
        empty={{ icon: FileText, label: "No content yet." }}
        skeleton={<Skeleton className="h-64 w-full rounded-lg" />}
      >
        <ChartContainer config={contentConfig} className="aspect-auto h-64 w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 12 }} barSize={18}>
            <CartesianGrid horizontal={false} />
            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={86} />
            <XAxis type="number" hide allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="live" stackId="content" fill="var(--color-live)" radius={[4, 0, 0, 4]} />
            <Bar dataKey="draft" stackId="content" fill="var(--color-draft)" radius={[0, 4, 4, 0]} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </QueryState>
    </Panel>
  );
}

const topicsConfig = { count: { label: "Services", color: "var(--chart-1)" } };

function TopicsChart({ topics }) {
  // Names, never codes: this is what an editor recognises.
  const chartData = useMemo(
    () =>
      (topics.data?.data ?? [])
        .filter((topic) => topic.service_count > 0)
        .map((topic) => ({ name: topic.name, count: topic.service_count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
    [topics.data],
  );

  return (
    <Panel title="Services by family / topic" description="How the service pages are grouped" href="/services/family-topic?page=1&limit=10">
      <QueryState
        state={topics}
        isEmpty={chartData.length === 0}
        empty={{ icon: FolderTree, label: "No services are grouped into a family / topic yet." }}
        skeleton={<Skeleton className="h-64 w-full rounded-lg" />}
      >
        <ChartContainer
          config={topicsConfig}
          className="aspect-auto w-full"
          style={{ height: Math.max(200, chartData.length * 40 + 16) }}
        >
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 24 }} barSize={20}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={120}
              tickFormatter={(name) => truncate(name, 18)}
            />
            <XAxis type="number" hide allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </QueryState>
    </Panel>
  );
}

function EnquiryStatusChart({ enquiries }) {
  const { chartData, total } = useMemo(() => {
    const counts = {};
    (enquiries.data?.rows ?? []).forEach((row) => {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
    });
    const items = Object.entries(ENQUIRY_STATUS)
      .map(([key, meta]) => ({ key, name: meta.label, value: counts[key] ?? 0, fill: meta.color }))
      .filter((item) => item.value > 0);
    return { chartData: items, total: items.reduce((sum, item) => sum + item.value, 0) };
  }, [enquiries.data]);

  const config = Object.fromEntries(
    Object.entries(ENQUIRY_STATUS).map(([key, meta]) => [key, { label: meta.label, color: meta.color }]),
  );

  return (
    <Panel title="Enquiry status" description="Where the latest enquiries stand" href="/enquiries?page=1&limit=10">
      <QueryState
        state={enquiries}
        isEmpty={total === 0}
        empty={{ icon: MessageSquare, label: "No enquiries yet." }}
        skeleton={<Skeleton className="h-52 w-full rounded-lg" />}
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
          <div className="relative size-48 shrink-0">
            <ChartContainer config={config} className="aspect-square size-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2} strokeWidth={0}>
                  {chartData.map((item) => (
                    <Cell key={item.key} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold leading-none">{formatNumber(total)}</span>
              <span className="mt-1 text-xs text-muted-foreground">enquiries</span>
            </div>
          </div>

          <ul className="w-full max-w-60 space-y-2.5 text-sm">
            {chartData.map((item) => (
              <li key={item.key} className="flex items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: item.fill }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="ml-auto font-medium tabular-nums">{formatNumber(item.value)}</span>
                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                  {Math.round((item.value / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </QueryState>
    </Panel>
  );
}

/* =========================================================
   Latest activity lists
========================================================= */

function Avatar({ name }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary">
      {(name || "?").trim().charAt(0)}
    </div>
  );
}

function ActivityRow({ href, name, line, meta, badge }) {
  return (
    <Link href={href} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50">
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{line}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {badge}
        <span className="text-xs text-muted-foreground">{meta}</span>
      </div>
      <ChevronRight className="hidden size-4 shrink-0 text-muted-foreground/40 sm:block" />
    </Link>
  );
}

function LatestEnquiries({ enquiries }) {
  const rows = (enquiries.data?.rows ?? []).slice(0, 5);

  return (
    <Panel title="Latest enquiries" description="Most recent enquiry form submissions" href="/enquiries?page=1&limit=10">
      <QueryState
        state={enquiries}
        isEmpty={rows.length === 0}
        empty={{ icon: MessageSquare, label: "No enquiries yet." }}
        skeleton={<ListSkeleton />}
      >
        <div className="divide-y divide-border/60">
          {rows.map((row) => {
            const status = ENQUIRY_STATUS[row.status];
            return (
              <ActivityRow
                key={row.id}
                href={`/enquiries/${row.id}/edit`}
                name={row.name}
                line={row.requirement || row.subject || row.page_title || row.phone}
                meta={moment(row.created_at).fromNow()}
                badge={
                  <Badge variant="outline" className={cn("font-normal", status?.badge)}>
                    {status?.label ?? row.status}
                  </Badge>
                }
              />
            );
          })}
        </div>
      </QueryState>
    </Panel>
  );
}

function LatestQueries({ queries }) {
  const rows = (queries.data?.rows ?? []).slice(0, 5);

  return (
    <Panel title="Latest queries" description="Most recent contact form messages" href="/queries?page=1&limit=10">
      <QueryState
        state={queries}
        isEmpty={rows.length === 0}
        empty={{ icon: Mail, label: "No queries yet." }}
        skeleton={<ListSkeleton />}
      >
        <div className="divide-y divide-border/60">
          {rows.map((row) => (
            <ActivityRow
              key={row.id}
              href="/queries?page=1&limit=10"
              name={row.name}
              line={row.subject || row.email || row.phone}
              meta={moment(row.created_at).fromNow()}
              badge={
                row.reason ? (
                  <Badge variant="secondary" className="max-w-24 truncate font-normal capitalize">
                    {row.reason}
                  </Badge>
                ) : null
              }
            />
          ))}
        </div>
      </QueryState>
    </Panel>
  );
}

/* =========================================================
   Header actions
========================================================= */

function HeaderActions() {
  const queryClient = useQueryClient();
  const isDashboardQuery = (query) => ["dashboard", "service-family-topics"].includes(query.queryKey[0]);
  const fetching = useIsFetching({ predicate: isDashboardQuery }) > 0;

  const refresh = () => {
    queryClient.invalidateQueries({ predicate: isDashboardQuery });
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={refresh} disabled={fetching} aria-label="Refresh dashboard">
        <RefreshCw className={cn("size-4", fetching && "animate-spin")} />
        <span className="hidden sm:inline">Refresh</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm">
            <Plus className="size-4" />
            New
            <ChevronDown className="size-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Create</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {CREATE_LINKS.map(({ label, href, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href}>
                <Icon className="size-4" />
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* =========================================================
   Page
========================================================= */

export default function DashboardPage() {
  const data = useDashboardData();
  const topics = useAllServiceFamilyTopics();

  return (
    <PageContainer
      pageTitle="Dashboard"
      pageDescription="Overview of your content, enquiries and activity."
      pageHeaderAction={<HeaderActions />}
    >
      <div className="space-y-6 pb-6 pt-4">
        <StatCards data={data} services={data.services} topics={topics} />

        <div className="grid gap-6 xl:grid-cols-3">
          <ActivityChart enquiries={data.enquiries} queries={data.queries} />
          <ContentChart data={data} services={data.services} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TopicsChart topics={topics} />
          <EnquiryStatusChart enquiries={data.enquiries} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <LatestEnquiries enquiries={data.enquiries} />
          <LatestQueries queries={data.queries} />
        </div>
      </div>
    </PageContainer>
  );
}
