"use client";

import { AdSenseProps } from "@rubros/types";
import { TopAd, SideAd, InFeedAd } from "./adsense";
import { MockTopAd, MockSideAd, MockInFeedAd, MockSquareAd, MockFooterAd } from "@rubros/ui";

const isDevelopment = process.env.NODE_ENV === "development";

export type AdComponentProps = {
  type: "top" | "side" | "in-feed" | "square" | "footer";
} & Omit<AdSenseProps, "slot">;

export function AdComponent({ type, ...props }: AdComponentProps) {
  if (isDevelopment) {
    switch (type) {
      case "top":
        return <MockTopAd {...props} />;
      case "side":
        return <MockSideAd {...props} />;
      case "in-feed":
        return <MockInFeedAd {...props} />;
      case "square":
        return <MockSquareAd {...props} />;
      case "footer":
        return <MockFooterAd {...props} />;
    }
  }

  switch (type) {
    case "top":
      return <TopAd {...props} />;
    case "side":
      return <SideAd {...props} />;
    case "in-feed":
    case "square":
    case "footer":
      return <InFeedAd {...props} />;
  }
}