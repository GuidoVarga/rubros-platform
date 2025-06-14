import { ReactNode } from "react";
import { PaginationBar } from "../PaginationBar/PaginationBar";
import { AdComponent } from "@/components/ads/ads";
import { ITEMS_PER_PAGE } from "@/constants/pagination";

export type PaginatedListProps<T> = {
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
  adPosition = Math.floor(ITEMS_PER_PAGE / 2),
}: PaginatedListProps<T>) {

  const parsedItems = [...items.slice(0, adPosition), {} as T, ...items.slice(adPosition)];

  return (
    <div className="space-y-8">
      <div className={gridClassName}>
        {parsedItems.map((item, index) => {
          //@ts-ignore
          const isAdd = !item?.id;
          //@ts-ignore
          const key = isAdd ? `${index}-ad` : item?.id;
          return (
            <div key={key}>
              {isAdd ?
                <div className="w-full h-full min-h-[200px]">
                  <AdComponent type="in-feed" style={{ height: "100%" }} />
                </div>
                : renderItem(item, index)}
            </div>
          )
        })}
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