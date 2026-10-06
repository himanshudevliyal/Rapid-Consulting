"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { imageSrc } from "@/lib/image-src";

// Small picture next to the title; a plain box when there is no image.
function Thumb({ value }) {
  return value ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageSrc(value)} alt="" className="size-10 shrink-0 rounded object-cover" />
  ) : (
    <div className="size-10 shrink-0 rounded bg-muted" aria-hidden="true" />
  );
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const columns = (openModal, setId) => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Thumb value={row.original.cover_image} />
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="font-mono text-xs text-muted-foreground">{row.original.slug}</div>
        </div>
      </div>
    ),
  },
  {
    id: "client",
    header: "Client",
    cell: ({ row }) => (
      <div>
        <div className="text-sm">{row.original.client_name || "—"}</div>
        {row.original.industry && <div className="text-xs text-muted-foreground">{row.original.industry}</div>}
      </div>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags ?? [];
      return tags.length ? (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && <span className="text-xs text-muted-foreground">+{tags.length - 2}</span>}
        </div>
      ) : (
        "—"
      );
    },
  },
  {
    accessorKey: "is_published",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_published ? "default" : "secondary"}>
        {row.original.is_published ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    accessorKey: "published_at",
    header: "Published on",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.published_at)}</span>,
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.updated_at)}</span>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/case-studies/${id}/edit`} className="w-full">
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setId(id);
                openModal();
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
