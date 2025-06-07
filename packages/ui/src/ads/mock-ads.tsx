"use client";

interface MockAdProps {
  width?: string;
  height?: string;
  label?: string;
  className?: string;
}

export function MockAd({ width = "100%", height = "100%", label = "Anuncio", className }: MockAdProps) {
  return (
    <div
      className={`bg-muted/30 border border-dashed border-muted-foreground/25 flex items-center justify-center ${className}`}
      style={{ width, height }}
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

export function MockTopAd() {
  return (
    <div className="w-full">
      <MockAd
        height="90px"
        label="Anuncio Superior"
        className="rounded-md"
      />
    </div>
  );
}

export function MockSideAd() {
  return (
    <div className="w-full">
      <MockAd
        height="600px"
        label="Anuncio Lateral"
        className="rounded-md sticky top-24"
      />
    </div>
  );
}

export function MockInFeedAd() {
  return (
    <div className="w-full">
      <MockAd
        height="200px"
        label="Anuncio en Feed"
        className="rounded-md"
      />
    </div>
  );
}

export function MockSquareAd() {
  return (
    <div className="w-full">
      <MockAd
        height="250px"
        label="Anuncio Cuadrado"
        className="rounded-md"
      />
    </div>
  );
}

export function MockFooterAd() {
  return (
    <div className="w-full">
      <MockAd
        height="150px"
        label="Anuncio Footer"
        className="rounded-md"
      />
    </div>
  );
}