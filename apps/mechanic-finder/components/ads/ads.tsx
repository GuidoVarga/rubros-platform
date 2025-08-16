"use client";

import { AdSenseProps } from "@rubros/types";
import { AdComponent as UIAdComponent, AdComponentProps as UIAdComponentProps } from "@rubros/ui";
import { AdSenseComponent } from "./AdSenseComponent";
import { ADSENSE_SLOTS } from "@rubros/ui/constants";

export type AdComponentProps = {
  type: ADSENSE_SLOTS;
} & Omit<AdSenseProps, "slot">;


const defaultStyles: Record<AdComponentProps["type"], { width?: string; height?: string }> = {
  [ADSENSE_SLOTS.TOP]: {
    height: "90px",
  },
  [ADSENSE_SLOTS.SIDE]: {
    width: "100%",
    height: "600px",
  },
  [ADSENSE_SLOTS.IN_FEED]: {
    height: "100%",
  },
  [ADSENSE_SLOTS.SQUARE]: {
    width: "100%",
    height: "600px",
  },
  [ADSENSE_SLOTS.FOOTER]: {
    height: "150px",
  },
  [ADSENSE_SLOTS.LIST]: {
    height: "100%"
  }
}

const getAdSlot = (type: AdComponentProps["type"]) => {
  switch (type) {
    case ADSENSE_SLOTS.TOP:
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP || '';
    case ADSENSE_SLOTS.SIDE:
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDE || ''
    case ADSENSE_SLOTS.IN_FEED:
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED || '';
    case ADSENSE_SLOTS.SQUARE:
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_SQUARE || '';
    case ADSENSE_SLOTS.FOOTER:
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER || '';
    case ADSENSE_SLOTS.LIST:
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_LIST || '';
    default:
      return process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_FEED || '';
  }
};

export function AdComponent({ type, ...props }: AdComponentProps) {
  const RealAdComponent = (adProps: Omit<AdSenseProps, "slot">) => {
    const slot = getAdSlot(type);
    const style = defaultStyles[type];
    return (
      <AdSenseComponent
        slot={slot}
        type={type}
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