"use client";

import { AdSenseProps } from "@rubros/types";
import { AdComponent as UIAdComponent, AdComponentProps as UIAdComponentProps } from "@rubros/ui";
import { AdSenseComponent } from "./AdSenseComponent";

export type AdComponentProps = {
  type: "top" | "side" | "in-feed" | "square" | "footer";
} & Omit<AdSenseProps, "slot">;


const defaultStyles: Record<AdComponentProps["type"], { width?: string; height?: string }> = {
  top: {
    height: "90px",
  },
  side: {
    width: "100%",
    height: "600px",
  },
  "in-feed": {
    height: "100%",
  },
  square: {
    width: "100%",
    height: "600px",
  },
  footer: {
    height: "150px",
  },
}

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
  const RealAdComponent = (adProps: Omit<AdSenseProps, "slot">) => {
    const slot = getAdSlot(type);
    const style = defaultStyles[type];
    return (
      <AdSenseComponent
        slot={slot}
        style={style}
        {...adProps}
      />
    );
  }

  return (
    <UIAdComponent
      type={type}
      realAdComponent={RealAdComponent}
      {...props}
    />
  );
}