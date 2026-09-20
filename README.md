# JARVIS Nexus

I want to redesign the frontend of my existing JARVIS student AI application.

IMPORTANT:

Do NOT rebuild the project from scratch.

Do NOT remove, replace, or break any existing API functionality.

Do NOT change the existing Supabase Edge Functions or Gemini API integration unless absolutely necessary.

The existing project already has working functionality for:

1. JARVIS AI question answering through:

   /functions/v1/jarvis-ask

2. AI Study Plan generation through:

   /functions/v1/generate-study-plan

3. Existing React pages:

   - HomePage

   - PlannerPage

   - AboutPage

4. Existing navigation between pages.

5. Existing environment variables and Supabase configuration.

I want you to keep all of this functionality working.

I have attached/provided a visual reference of the new JARVIS interface.

Redesign the frontend to closely match this visual direction:

- Futuristic JARVIS / Iron-Man-inspired academic assistant

- Very dark navy/black space background

- Glowing electric blue/cyan accents

- Large central JARVIS AI orb/logo area

- Premium glassmorphism cards

- Thin glowing blue borders

- Subtle space/galaxy/planet atmosphere

- Clean futuristic typography

- Professional, not cartoonish

- Smooth hover effects and subtle animations

- Responsive on desktop, tablet and mobile

HOME PAGE STRUCTURE:

1. Top navigation

   - JARVIS logo on left

   - Home

   - Study Planner

   - About

   - JARVIS ONLINE status indicator on right

2. Hero section

   - Large JARVIS circular AI orb/logo in the center

   - JARVIS title

   - "Study Smarter. Go Further."

   - "Your Intelligent Academic Companion"

   - Main "Get Started" button

   - Futuristic space/planet background

3. Four feature/action cards:

   - Study Planner

     "Create a personalized study plan."

   - Ask JARVIS

     "Get AI-powered answers to your doubts."

   - Quiz Me

     "Practice with AI-generated questions."

   - Focus Mode

     "Stay focused and get more done."

4. Dashboard section:

   - Today's Mission

   - Your Progress

   - Motivational quote card

5. Today's Mission card should visually show:

   - Current/high priority study task

   - Subject/topic

   - Estimated duration

   - Short description

   - Start Mission button

6. Progress card should show:

   - Circular progress percentage

   - Topics completed

   - Day streak

   - Quizzes taken

7. Motivational quote card:

   - Futuristic glass card

   - Quote

   - JARVIS attribution

FUNCTIONALITY REQUIREMENTS:

The "Ask JARVIS" functionality must continue using the existing

jarvis-ask Supabase Edge Function.

Do not replace the API call with mock data.

The Study Planner must continue using the existing

generate-study-plan Supabase Edge Function.

Do not replace it with static/demo data.

Buttons must remain functional:

- Get Started -> Study Planner

- Study Planner -> Planner page

- Ask JARVIS -> AI question interface

- Start Mission -> appropriate study/planner action

- About -> About page

Keep the existing TypeScript architecture where practical.

Reuse existing components and functionality when possible rather than creating unnecessary duplicate components.

IMPORTANT VISUAL REQUIREMENT:

Use the attached JARVIS screenshot as the primary visual inspiration for layout, spacing, colors, card style, glow effects and overall composition.

Do not simply create another generic AI dashboard.

The result should feel like a polished futuristic JARVIS academic assistant.

Also make sure:

- No broken Tailwind classes

- No TypeScript errors

- No unused imports

- No broken API calls

- No console errors

- Desktop layout should closely resemble the reference

- Mobile layout should remain usable and responsive

Before finishing, verify that:

1. npm build succeeds

2. Existing API calls are still present

3. Study Planner still works

4. Ask JARVIS still works

5. Navigation still works

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b560e7a1-5824-403d-ad7f-5608f10d1295).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
