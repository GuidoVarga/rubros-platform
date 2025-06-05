"use client";

import { TopAd, SideAd, InFeedAd } from "./adsense";
import { MockTopAd, MockSideAd, MockInFeedAd, MockSquareAd } from "./mock-ads";

const isDevelopment = process.env.NODE_ENV === "development";

export function AdComponent({ type }: { type: "top" | "side" | "in-feed" | "square" }) {
  if (isDevelopment) {
    switch (type) {
      case "top":
        return <MockTopAd />;
      case "side":
        return <MockSideAd />;
      case "in-feed":
        return <MockInFeedAd />;
      case "square":
        return <MockSquareAd />;
    }
  }

  switch (type) {
    case "top":
      return <TopAd />;
    case "side":
      return <SideAd />;
    case "in-feed":
      return <InFeedAd />;
    case "square":
      return <InFeedAd />;
  }
}