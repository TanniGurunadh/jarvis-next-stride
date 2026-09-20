import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About — JARVIS" },
    { name: "description", content: "Meet the student-built vision behind the JARVIS intelligent academic companion." },
    { property: "og:title", content: "About — JARVIS" },
    { property: "og:description", content: "JARVIS is built by students to make exam preparation clearer and more effective." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}), component: AboutPage,
});
