"use client";

import { PageHeader } from "@/components/dashboard/ui";
import { useDashTheme } from "@/components/dashboard/DashContext";

export default function CalendarPage() {
  const { theme } = useDashTheme();

  // TradingView's free economic-calendar widget.
  const config = {
    colorTheme: theme,
    isTransparent: false,
    locale: "en",
    countryFilter: "us,gb,eu,jp,au,ca,ch,nz,cn",
    importanceFilter: "0,1",
    width: "100%",
    height: "640",
  };
  const src =
    "https://www.tradingview-widget.com/embed-widget/events/?locale=en#" +
    encodeURIComponent(JSON.stringify(config));

  return (
    <>
      <PageHeader
        title="Economic Calendar"
        subtitle="High-impact news events. Plan your trades around them."
      />
      <div className="dash-card overflow-hidden p-1">
        <iframe
          key={theme}
          src={src}
          title="Economic calendar"
          className="h-[640px] w-full border-0"
          loading="lazy"
        />
      </div>
    </>
  );
}
