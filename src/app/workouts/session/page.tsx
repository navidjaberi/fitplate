import type { Metadata } from "next";
import { WorkoutSession } from "@/components/workouts/WorkoutSession";

export const metadata: Metadata = { title: "Workout · FitPlate" };

export default function WorkoutSessionPage() {
  return <WorkoutSession />;
}
