import type { Metadata } from "next";
import { HistoryView } from "@/components/HistoryView";

export const metadata: Metadata = { title: "History · Kalori" };

export default function HistoryPage() {
  return <HistoryView />;
}
