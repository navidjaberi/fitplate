import type { Metadata } from "next";
import { Scanner } from "@/components/Scanner";
import { TodayPanel } from "@/components/TodayPanel";

export const metadata: Metadata = { title: "Scan a meal · FitPlate" };

export default function ScanPage() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
      <Scanner />
      <div className="lg:sticky lg:top-24">
        <TodayPanel />
      </div>
    </div>
  );
}
