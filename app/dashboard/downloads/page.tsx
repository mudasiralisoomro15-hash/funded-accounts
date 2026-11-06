import { Download, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";

const ITEMS = [
  {
    title: "MetaTrader 5",
    text: "Trading platform for Windows, macOS, Android and iOS. Use the login details sent by support.",
    href: "https://www.metatrader5.com/en/download",
  },
];

export default function DownloadsPage() {
  return (
    <>
      <PageHeader title="Downloads" subtitle="Platforms and files you need to start trading." />
      <div className="grid gap-4 sm:grid-cols-2">
        {ITEMS.map((d) => (
          <div key={d.title} className="dash-card p-5">
            <span className="dash-soft dash-primary-text flex h-10 w-10 items-center justify-center rounded-lg">
              <Download className="h-5 w-5" />
            </span>
            <h2 className="dash-text mt-3 font-semibold">{d.title}</h2>
            <p className="dash-sub mt-1 text-sm">{d.text}</p>
            <a href={d.href} target="_blank" rel="noopener noreferrer" className="dash-btn mt-4">
              Download <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
