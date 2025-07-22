"use client";

import { AdSenseProps } from "@rubros/types";
import { MockTopAd, MockSideAd, MockInFeedAd, MockSquareAd, MockFooterAd } from "./mock-ads";

export type AdComponentProps = {
  type: "top" | "side" | "in-feed" | "square" | "footer";
  useMockInDevelopment?: boolean;
  realAdComponent?: React.ComponentType<Omit<AdSenseProps, "slot">>;
} & Omit<AdSenseProps, "slot">;

export function AdComponent({
  type,
  useMockInDevelopment = true,
  realAdComponent: RealAdComponent,
  ...props
}: AdComponentProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Use mock ads in development if configured to do so
  if (isDevelopment && useMockInDevelopment) {
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

  // Use real ad component if provided
  if (RealAdComponent) {
    return <RealAdComponent {...props} />;
  }

  // Fallback to mock if no real component is provided
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