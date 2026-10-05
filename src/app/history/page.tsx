import type { Metadata } from "next";
import { HistoryView } from "@/components/HistoryView";

export const metadata: Metadata = { title: "Progress · FitPlate" };

export default function HistoryPage() {
  return <HistoryView />;
}
