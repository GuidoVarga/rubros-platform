import { ReactNode } from "react";

export type PaginatedListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemsPerPage: number;
  gridClassName?: string;
  showItemCount?: boolean;
  adPosition?: number;
  renderAd?: ({ type, style }: { type: string, style: React.CSSProperties }) => ReactNode;
}

export function PaginatedList<T>({
  items,
  renderItem,
  itemsPerPage,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  adPosition = Math.floor((itemsPerPage) / 2),
  renderAd,
}: PaginatedListProps<T>) {

  const parsedItems = [...items.slice(0, adPosition), {} as T, ...items.slice(adPosition)];

  return (
    <div>
      <div className={gridClassName}>
        {parsedItems.map((item, index) => {
          //@ts-expect-error - Id exists in the item
          const isAdd = !item?.id;
          //@ts-expect-error - Id exists in the item
          const key = isAdd ? `${index}-ad` : item?.id;
          return (
            <div key={key}>
              {isAdd ?
                <div className="w-full h-full min-h-[200px]">
                  {renderAd && renderAd({ type: "in-feed", style: { height: "100%" } })}
                </div>
                : renderItem(item, index)}
            </div>
          )
        })}
      </div>
    </div>
  );
}