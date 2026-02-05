"use client";

import { formatDate } from "@/lib/utils";
import { Page } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, More, Trash } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deletePage } from "@/lib/api/website-pages";

function Action({ id, pageId }: { id: number; pageId: string }) {
  const { refresh } = useRouter();

  const handleDelete = async () => {
    try {
      const response = await deletePage(id);
      toast.success(response.message);
      refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <More className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] sm:w-[180px] md:w-[200px]">
        <DropdownMenuLabel className="text-xs sm:text-sm">Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <Link href={`/dashboard/website-setup/pages/${pageId}`}>
            <DropdownMenuItem className="text-blue-600 text-xs sm:text-sm">
              <Edit variant="Bold" className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Edit
            </DropdownMenuItem>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger className="w-full">
              <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-xs sm:text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 w-full">
                <Trash variant="Bold" className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90vw] max-w-[400px] sm:max-w-[425px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base sm:text-lg">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm sm:text-base">
                  This action cannot be undone. This will permanently remove
                  your page from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="text-xs sm:text-sm">
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<Page>[] = [
  {
    header: "#",
    cell: ({ row }) => {
      return <span className="text-xs sm:text-sm">{row.index + 1}</span>;
    },
    size: 50,
  },
  {
    accessorKey: "name",
    header: "Page Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return (
        <span className="text-xs sm:text-sm truncate" title={name}>
          {name}
        </span>
      );
    },
    size: 200,
  },
  {
    accessorKey: "slug",
    header: "Page Slug",
    cell: ({ row }) => {
      const slug = row.getValue("slug") as string;
      return (
        <span className="text-xs sm:text-sm truncate font-mono bg-gray-100 px-2 py-1 rounded" title={slug}>
          {slug}
        </span>
      );
    },
    size: 180,
  },
  {
    header: "Created At",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <span className="text-xs sm:text-sm whitespace-nowrap">
          {formatDate(new Date(data.createdAt))}
        </span>
      );
    },
    size: 120,
  },
  {
    header: "Action",
    cell: ({ row }) => {
      const data = row.original;

      return <Action id={data.id} pageId={data.pageId} />;
    },
    size: 80,
  },
];