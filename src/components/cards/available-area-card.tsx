"use client";
import { generateRandomNumbers, getInitials } from "@/lib/utils";
import { AvailableAreaCardProps } from "@/types";
import getSymbolFromCurrency from "currency-symbol-map";

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
import { Button } from "../ui/button";
import { deleteAvailableArea } from "@/lib/api/available-areas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AvailableAreaCard = ({ color, data }: AvailableAreaCardProps) => {
  const router = useRouter();

  let bgColor = "bg-gray-50";
  let textColor = "text-gray-500";

  switch (color) {
    case "green":
      bgColor = "bg-green-50";
      textColor = "text-green-500";
      break;

    case "blue":
      bgColor = "bg-blue-50";
      textColor = "text-blue-500";
      break;

    case "yellow":
      bgColor = "bg-yellow-50";
      textColor = "text-yellow-500";
      break;

    case "rose":
      bgColor = "bg-rose-50";
      textColor = "text-rose-500";
      break;

    case "orange":
      bgColor = "bg-orange-50";
      textColor = "text-orange-500";
      break;

    case "lime":
      bgColor = "bg-lime-50";
      textColor = "text-lime-500";
      break;

    case "teal":
      bgColor = "bg-teal-50";
      textColor = "text-teal-500";
      break;

    case "indigo":
      bgColor = "bg-indigo-50";
      textColor = "text-indigo-500";
      break;

    case "cyan":
      bgColor = "bg-cyan-50";
      textColor = "text-cyan-500";
      break;

    case "purple":
      bgColor = "bg-purple-50";
      textColor = "text-purple-500";
      break;

    default:
      bgColor = "bg-primary/10";
      textColor = "text-primary";
      break;
  }

  const handleDelete = async () => {
    try {
      const response = await deleteAvailableArea(data.id);
      toast.success(response.message);

      router.push("?" + generateRandomNumbers(1, 9));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

const getCurrency = () => {
  const s = data?.user?.siteSettings;

  if (!s) return "₹"; // fallback

  // If array → use first item
  if (Array.isArray(s)) {
    return s[0]?.currency ?? "₹";
  }

  // If object → read directly
  return s.currency ?? "₹";
};


  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div
          className={
            "rounded-md w-14 h-14 flex items-center justify-center text-center " +
            bgColor +
            " " +
            textColor
          }
        >
          {getInitials(data.area)}
        </div>

        <div>
          <p className="font-medium block">{data.area}</p>
          <span className="block text-sm mt-1 text-black/50">
         {getSymbolFromCurrency(getCurrency()) + data.charges}

          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <More />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <Link href={"/settings/available-areas/" + data.areaId}>
              <DropdownMenuItem className="text-blue-600">
                <Edit variant="Bold" className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger className="w-full">
                <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 w-full">
                  <Trash variant="Bold" className="mr-2 h-4 w-4" />
                  Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove
                    this available area from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AvailableAreaCard;
