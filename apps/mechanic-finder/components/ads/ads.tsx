"use client";

import { AdSenseProps } from "@rubros/types";
import { AdComponent as UIAdComponent, AdComponentProps as UIAdComponentProps } from "@rubros/ui";
import { AdSenseComponent } from "./AdSenseComponent";

export type AdComponentProps = {
  type: "top" | "side" | "in-feed" | "square" | "footer";
} & Omit<AdSenseProps, "slot">;

const getAdSlot = (type: AdComponentProps["type"]) => {
  switch (type) {
    case "top":
      return "top-ad";
    case "side":
      return "side-ad";
    case "in-feed":
      return "in-feed-ad";
    case "square":
      return "square-ad";
    case "footer":
      return "footer-ad";
    default:
      return "in-feed-ad";
  }
};

export function AdComponent({ type, ...props }: AdComponentProps) {
  const RealAdComponent = (adProps: Omit<AdSenseProps, "slot">) => (
    <AdSenseComponent
      slot={getAdSlot(type)}
      {...adProps}
    />
  );

  return (
    <UIAdComponent
      type={type}
      realAdComponent={RealAdComponent}
      {...props}
    />
  );
}