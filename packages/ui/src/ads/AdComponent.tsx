"use client";

import { AdSenseProps } from "@rubros/types";
import { MockTopAd, MockSideAd, MockInFeedAd, MockSquareAd, MockFooterAd } from "./mock-ads";
import { ADSENSE_SLOTS } from "../constants";

export type AdComponentProps = {
  type: ADSENSE_SLOTS;
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
      case ADSENSE_SLOTS.TOP:
        return <MockTopAd {...props} />;
      case ADSENSE_SLOTS.SIDE:
        return <MockSideAd {...props} />;
      case ADSENSE_SLOTS.IN_FEED:
        return <MockInFeedAd {...props} />;
      case ADSENSE_SLOTS.SQUARE:
        return <MockSquareAd {...props} />;
      case ADSENSE_SLOTS.FOOTER:
        return <MockFooterAd {...props} />;
    }
  }

  // Use real ad component if provided
  if (RealAdComponent) {
    return <RealAdComponent {...props} />;
  }

  // Fallback to mock if no real component is provided
  switch (type) {
    case ADSENSE_SLOTS.TOP:
      return <MockTopAd {...props} />;
    case ADSENSE_SLOTS.SIDE:
      return <MockSideAd {...props} />;
    case ADSENSE_SLOTS.IN_FEED:
      return <MockInFeedAd {...props} />;
    case ADSENSE_SLOTS.SQUARE:
      return <MockSquareAd {...props} />;
    case ADSENSE_SLOTS.FOOTER:
      return <MockFooterAd {...props} />;
  }
}