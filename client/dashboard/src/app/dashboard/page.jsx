"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import PageContainer from "@/components/layout/page-container";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useSubCategories } from "@/hooks/use-sub-categories";
import { useProductInquiries } from "@/hooks/use-product-inquiries";
import { useGetUsers } from "@/hooks/use-users";
import { useQueries } from "@/hooks/use-queries";
import {
  Boxes,
  LayoutGrid,
  Layers,
  MessageSquareText,
  Users as UsersIcon,
  Mail,
  ArrowUpRight,
  PackageOpen,
  Inbox,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import config from "@/config";

/* =========================================================
   Shared bits
========================================================= */

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function Thumb({ src, alt, className = "size-10 rounded-lg" }) {
  return src ? (
    <Image
      src={`${config.file_base}/${src}`}
      alt={alt || ""}
      width={40}
      height={40}
      className={cn(className, "object-cover")}
      unoptimized
    />
  ) : (
    <div
      className={cn(
        className,
        "bg-muted flex items-center justify-center text-muted-foreground/40",
      )}
    >
      <PackageOpen className="size-1/2" />
    </div>
  );
}

function SectionHeader({ title, description, viewAllHref }) {
  return (
    <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/60 pb-4">
      <div>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-0.5 text-xs">
            {description}
          </CardDescription>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="group inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </CardHeader>
  );
}

function EmptyState({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground/50">
        <Icon className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function RowLink({ href, children, className }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-1 py-3 transition-colors hover:bg-muted/50 rounded-lg -mx-1",
        className,
      )}
    >
      {children}
      <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground/40" />
    </Link>
  );
}

/* =========================================================
   Stat cards
========================================================= */

function StatCard({ title, value, icon: Icon, href, isLoading }) {
  return (
    <Link href={href} className="block">
      <Card className="group rounded-xl border-border/60 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex items-center justify-between p-5">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {title}
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-1.5 text-3xl font-semibold tracking-tight">
                {value ?? 0}
              </p>
            )}
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <Icon className="size-5" strokeWidth={1.8} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatCardsRow({ counts }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {counts.map((c) => (
        <StatCard key={c.title} {...c} />
      ))}
    </div>
  );
}

/* =========================================================
   Recent Products - premium table
========================================================= */

function ProductsTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-1 py-2">
          <Skeleton className="size-10 rounded-lg" />
          <Skeleton className="h-4 flex-1 max-w-48" />
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function RecentProductsTable({ data, isLoading }) {
  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <SectionHeader
        title="Recent Products"
        description="Latest items added to your catalog"
        viewAllHref="/products?page=1&limit=10"
      />
      <CardContent className="pt-4">
        {isLoading ? (
          <ProductsTableSkeleton />
        ) : data?.products?.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="border-border/60 hover:bg-muted/40"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Thumb src={product.thumbnail} alt={product.title} />
                        <span className="max-w-56 truncate font-medium">
                          {product.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category_title || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-normal",
                          product.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-border bg-muted text-muted-foreground",
                        )}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
                      >
                        Edit
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState icon={PackageOpen} label="No products yet." />
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   Recent Product Inquiries
========================================================= */

function InquirySkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-1 py-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function RecentInquiries({ data, isLoading }) {
  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <SectionHeader
        title="Product Inquiries"
        description="Latest customer inquiries"
        viewAllHref="/product-inquiries?page=1&limit=10"
      />
      <CardContent className="pt-2">
        {isLoading ? (
          <InquirySkeleton />
        ) : data?.product_inquiries?.length ? (
          <div className="divide-y divide-border/60">
            {data.product_inquiries.map((inquiry) => (
              <RowLink key={inquiry.id} href="/product-inquiries?page=1&limit=10">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {inquiry.full_name}
                    {inquiry.company_name && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {inquiry.company_name}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {inquiry.email} · {inquiry.products?.length ?? 0} item(s)
                    · {moment(inquiry.created_at).format("DD MMM, YYYY")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 font-normal capitalize",
                    statusStyles[inquiry.status] ||
                      "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {inquiry.status}
                </Badge>
              </RowLink>
            ))}
          </div>
        ) : (
          <EmptyState icon={MessageSquareText} label="No inquiries yet." />
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   Recent Queries
========================================================= */

function RecentQueries({ data, isLoading }) {
  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <SectionHeader
        title="Queries"
        description="Latest contact form submissions"
        viewAllHref="/queries?page=1&limit=10"
      />
      <CardContent className="pt-2">
        {isLoading ? (
          <InquirySkeleton />
        ) : data?.queries?.length ? (
          <div className="divide-y divide-border/60">
            {data.queries.map((query) => (
              <RowLink key={query.id} href="/queries?page=1&limit=10">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Mail className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{query.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {query.email || query.phone || ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {moment(query.created_at).format("DD MMM, YYYY")}
                </span>
              </RowLink>
            ))}
          </div>
        ) : (
          <EmptyState icon={Inbox} label="No queries yet." />
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   Recent Categories / Sub Categories
========================================================= */

function RecentCategories({ data, isLoading }) {
  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <SectionHeader
        title="Categories"
        description="Recently created categories"
        viewAllHref="/categories?page=1&limit=10"
      />
      <CardContent className="pt-2">
        {isLoading ? (
          <InquirySkeleton />
        ) : data?.categories?.length ? (
          <div className="divide-y divide-border/60">
            {data.categories.map((category) => (
              <RowLink
                key={category.id}
                href={`/categories/${category.id}/edit`}
              >
                <Thumb src={category.pictures?.[0]} alt={category.title} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {category.title}
                  </p>
                </div>
                {category.featured && (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-amber-200 bg-amber-50 font-normal text-amber-700"
                  >
                    Featured
                  </Badge>
                )}
              </RowLink>
            ))}
          </div>
        ) : (
          <EmptyState icon={FolderOpen} label="No categories yet." />
        )}
      </CardContent>
    </Card>
  );
}

function RecentSubCategories({ data, isLoading }) {
  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <SectionHeader
        title="Sub Categories"
        description="Recently created sub categories"
        viewAllHref="/sub-categories?page=1&limit=10"
      />
      <CardContent className="pt-2">
        {isLoading ? (
          <InquirySkeleton />
        ) : data?.sub_categories?.length ? (
          <div className="divide-y divide-border/60">
            {data.sub_categories.map((subCategory) => (
              <RowLink
                key={subCategory.id}
                href={`/sub-categories/${subCategory.id}/edit`}
              >
                <Thumb
                  src={subCategory.pictures?.[0]}
                  alt={subCategory.title}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {subCategory.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {subCategory.category_title || "-"}
                  </p>
                </div>
              </RowLink>
            ))}
          </div>
        ) : (
          <EmptyState icon={Layers} label="No sub categories yet." />
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   Page
========================================================= */

export default function DashboardPage() {
  const { data: products, isLoading: isProductsLoading } =
    useProducts("limit=10");
  const { data: categories, isLoading: isCategoriesLoading } =
    useCategories("limit=5");
  const { data: subCategories, isLoading: isSubCategoriesLoading } =
    useSubCategories("limit=5");
  const { data: inquiries, isLoading: isInquiriesLoading } =
    useProductInquiries("limit=10");
  const { data: users, isLoading: isUsersLoading } = useGetUsers("limit=1");
  const { data: queries, isLoading: isQueriesLoading } = useQueries("limit=5");

  const statCards = [
    {
      title: "Products",
      value: products?.total,
      icon: Boxes,
      href: "/products?page=1&limit=10",
      isLoading: isProductsLoading,
    },
    {
      title: "Categories",
      value: categories?.total,
      icon: LayoutGrid,
      href: "/categories?page=1&limit=10",
      isLoading: isCategoriesLoading,
    },
    {
      title: "Sub Categories",
      value: subCategories?.total,
      icon: Layers,
      href: "/sub-categories?page=1&limit=10",
      isLoading: isSubCategoriesLoading,
    },
    {
      title: "Product Inquiries",
      value: inquiries?.total,
      icon: MessageSquareText,
      href: "/product-inquiries?page=1&limit=10",
      isLoading: isInquiriesLoading,
    },
    {
      title: "Users",
      value: users?.total,
      icon: UsersIcon,
      href: "/users?page=1&limit=10",
      isLoading: isUsersLoading,
    },
    {
      title: "Queries",
      value: queries?.total,
      icon: Mail,
      href: "/queries?page=1&limit=10",
      isLoading: isQueriesLoading,
    },
  ];

  return (
    <PageContainer
      pageTitle="Dashboard"
      pageDescription="Overview of your store's catalog and customer activity."
    >
      <div className="space-y-6">
        <StatCardsRow counts={statCards} />

        <RecentProductsTable data={products} isLoading={isProductsLoading} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentInquiries data={inquiries} isLoading={isInquiriesLoading} />
          <RecentQueries data={queries} isLoading={isQueriesLoading} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentCategories
            data={categories}
            isLoading={isCategoriesLoading}
          />
          <RecentSubCategories
            data={subCategories}
            isLoading={isSubCategoriesLoading}
          />
        </div>
      </div>
    </PageContainer>
  );
}
