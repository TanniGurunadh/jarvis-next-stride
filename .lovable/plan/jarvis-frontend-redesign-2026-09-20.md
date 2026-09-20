# JARVIS Frontend Redesign

## Goal
Refresh the existing JARVIS student assistant to closely match the supplied futuristic interface while preserving the working AI question and study-plan behavior.

## Build
- Port the existing Home, Study Planner, and About experiences into the current TanStack app without changing either AI request contract.
- Add shared navigation with desktop and mobile states, a JARVIS mark, and the online indicator.
- Recompose Home around the central animated AI core, space horizon, four action cards, live Ask JARVIS panel, mission card, progress panel, and quote.
- Restyle Study Planner and About with the same dark glass, cyan linework, restrained glow, and responsive spacing while retaining all form, generation, completion, reset, and error states.
- Use separate `/`, `/planner`, and `/about` pages with route-specific metadata and working navigation.

## Technical details
- Keep POST requests to `/functions/v1/jarvis-ask` and `/functions/v1/generate-study-plan`, including their current payloads and authorization header.
- Preserve existing publishable environment configuration from the uploaded project; edge functions and Gemini integration remain untouched.
- Implement the visual system through semantic Tailwind v4 tokens in the shared stylesheet.
- Verify desktop and mobile layouts, navigation, interactive states, both API call paths, console output, and the automated build checks.
