import type { Metadata } from "next";
import { Scanner } from "@/components/Scanner";
import { TodayPanel } from "@/components/TodayPanel";

export const metadata: Metadata = { title: "Scan a meal · FitPlate" };

export default function ScanPage() {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] [&>*]:min-w-0">
      <Scanner />
      <div className="lg:sticky lg:top-24">
        <TodayPanel />
      </div>
    </div>
  );
}
