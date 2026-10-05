import type { Metadata } from "next";
import { WorkoutsView } from "@/components/workouts/WorkoutsView";

export const metadata: Metadata = { title: "Workouts · FitPlate" };

export default function WorkoutsPage() {
  return <WorkoutsView />;
}
