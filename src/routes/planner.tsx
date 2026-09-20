import { createFileRoute } from "@tanstack/react-router";
import PlannerPage from "@/components/PlannerPage";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [
    { title: "Study Planner — JARVIS" },
    { name: "description", content: "Generate a personalized AI study schedule around your subjects, exam date, and confidence." },
    { property: "og:title", content: "Study Planner — JARVIS" },
    { property: "og:description", content: "Build a personalized AI-powered exam preparation plan." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}), component: PlannerPage,
});
