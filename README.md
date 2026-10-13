# LifePilot AI — Amazon Developer Challenge 2026

LifePilot AI is an AI-powered personal goal-management web application that turns user goals into personalized plans with outcomes, milestones, and actionable tasks. It tracks progress and helps users adapt their plans when circumstances change.

## Features

- AI-powered planning for different types of personal goals
- Personalized outcomes, milestones, and actionable tasks
- Task completion and progress tracking
- AI-assisted replanning when circumstances change
- Goal-aware agent chat and conversation context
- Persistent memory, where configured
- Supabase authentication: signup, login, logout, and password recovery
- Supabase database with Row Level Security (RLS)

## Technology Stack

- **Next.js, React, TypeScript:** Web application and user interface
- **Google Gemini API:** AI-powered planning and replanning
- **Supabase:** Authentication and database services
- **Vercel:** Application deployment

## Run Locally

1. Install Node.js and npm.
2. Clone this repository and open the project directory.
3. Create a `.env.local` file in the project root.
4. Configure the environment variables required by the application:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (if required by your configuration)
5. Configure the Supabase database using the provided SQL file, if applicable.
6. Add `http://localhost:3000/auth/callback` to your Supabase authentication redirect URLs, if required by your configuration.
7. Install dependencies using `npm install`.
8. Start the development server using `npm run dev`.
9. Open `http://localhost:3000` in your browser.

Refer to the project's configuration and setup files for the exact environment variables and database instructions.

## Security

Never commit `.env.local`, API keys, access tokens, or other credentials to the repository.

## Demo

- **Live application:** https://life-pilot-ai-beige.vercel.app
- **Demo video:** https://vimeo.com/1234808841

