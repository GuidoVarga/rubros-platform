import { ReactNode } from "react";
import { PaginationBar } from "./pagination-bar";
import { AdComponent } from "../ads/ads";

interface PaginatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  gridClassName?: string;
  showItemCount?: boolean;
  adPosition?: number;
}

export function PaginatedList<T>({
  items,
  renderItem,
  pagination,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  showItemCount = true,
  adPosition = 7,
}: PaginatedListProps<T>) {
  console.log('items ', items);
  return (
    <div className="space-y-8">
      <div className={gridClassName}>
        {items.map((item, index) => (
          <>
            {renderItem(item, index)}
            {index === adPosition && (
              <div className="col-span-full">
                <AdComponent type="in-feed" />
              </div>
            )}
          </>
        ))}
      </div>

      <PaginationBar
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        showItemCount={showItemCount}
      />
    </div>
  );
}