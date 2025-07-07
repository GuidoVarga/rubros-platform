"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationBar, PaginationBarProps } from "@rubros/ui";

export type CustomPaginationBarProps = Omit<PaginationBarProps, 'routerConfig'>;

export function CustomPaginationBar({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  showItemCount = true,
}: CustomPaginationBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <PaginationBar
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      showItemCount={showItemCount}
      routerConfig={{
        pathname,
        searchParams,
        navigate: (url: string) => router.push(url),
      }}
    />
  )
}