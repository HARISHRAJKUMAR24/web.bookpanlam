"use client";

import CopyLink from "@/components/cards/copy-link";
import { siteUrl } from "@/config";

export default function SiteLink({ slug }: { slug: string }) {
  if (!slug) return null;

  return (
    <CopyLink
      text="Site Link"
      link={`${siteUrl}/${slug}`}
    />
  );
}
