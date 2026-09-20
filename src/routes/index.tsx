import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "JARVIS — Intelligent Academic Companion" },
    { name: "description", content: "Plan smarter, ask questions, and stay focused with the JARVIS AI academic companion." },
    { property: "og:title", content: "JARVIS — Intelligent Academic Companion" },
    { property: "og:description", content: "AI-powered study planning and academic support for focused learners." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: HomePage,
});
