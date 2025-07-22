"use client";

import { AdSenseProps } from "@rubros/types";

type MockAdProps = Omit<AdSenseProps, "slot"> & {
  label?: string;
}

export function MockAd({ style, label = "Anuncio", className }: MockAdProps) {
  const width = style?.width || "100%";
  const height = style?.height || "100%";
  const finalStyle = {
    width,
    height,
    minWidth: '300px',
    minHeight: '100px',
    ...style,
    maxWidth: "1100px"
  };

  return (
    <div
      className={`bg-muted/30 border border-dashed border-muted-foreground/25 flex items-center justify-center ${className}`}
      style={finalStyle}
    >
      <div className="text-center">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-muted-foreground/50 text-xs">
          {width} x {height}
        </p>
      </div>
    </div>
  );
}

export function MockTopAd(props: MockAdProps) {
  const style = {
    ...props.style,
    height: props.style?.height || "90px",
  }
  return (
    <div className="w-full h-full flex justify-center items-center">
      <MockAd
        style={style}
        label="Anuncio Superior"
        className={`rounded-md ${props.className}`}
      />
    </div>
  );
}

export function MockSideAd(props: MockAdProps) {
  const style = {
    ...props.style,
    height: props.style?.height || "600px",
  }
  return (
    <div className="w-full h-full flex justify-center items-center">
      <MockAd
        style={style}
        label="Anuncio Lateral"
        className={`rounded-md sticky top-24 ${props.className}`}
      />
    </div>
  );
}

export function MockInFeedAd(props: MockAdProps) {
  const style = {
    ...props.style,
    height: props.style?.height || "300px",
  }
  return (
    <div className="w-full h-full flex justify-center items-center">
      <MockAd
        style={style}
        label="Anuncio en Feed"
        className={`rounded-md ${props.className}`}
      />
    </div>
  );
}

export function MockSquareAd(props: MockAdProps) {
  const style = {
    ...props.style,
    height: props.style?.height || "250px",
  }
  return (
    <div className="w-full h-full flex justify-center items-center">
      <MockAd
        style={style}
        label="Anuncio Cuadrado"
        className={`rounded-md ${props.className}`}
      />
    </div>
  );
}

export function MockFooterAd(props: MockAdProps) {
  const style = {
    ...props.style,
    height: props.style?.height || "150px",
  }
  return (
    <div className="w-full h-full flex justify-center items-center">
      <MockAd
        style={style}
        label="Anuncio Footer"
        className={`rounded-md ${props.className}`}
      />
    </div>
  );
}